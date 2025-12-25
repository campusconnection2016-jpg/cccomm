import React, { useState, useEffect, useRef } from "react";
import { getTestcandidateCameraApi, addCameraScreenshots_API } from "../../../api/endpoints";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";

const CameraComponent = ({ id }) => {
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [userConfirmed, setUserConfirmed] = useState(null);

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  const [screenshots, setScreenshots] = useState([]);
  const [lastCaptureTime, setLastCaptureTime] = useState(0);

  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [modelError, setModelError] = useState("");

  const [ssdModel, setSsdModel] = useState(null);
  const [detectionRunning, setDetectionRunning] = useState(false);

  const prevFaceCenterRef = useRef(null);
  const noFaceFramesRef = useRef(0);

  const [lastAlertType, setLastAlertType] = useState(null);
  const [lastAlertTime, setLastAlertTime] = useState(0);

  // CONFIG (tune as you like)
  const ALERT_COOLDOWN_MS = 6000;          // 6s between same-type alerts
  const SCREENSHOT_COOLDOWN_MS = 4000;     // min 4s between screenshots
  const HEAD_TURN_THRESHOLD_RATIO = 0.15;  // how far nose can move from center
  const BIG_MOVE_THRESHOLD_PX = 30;        // more sensitive now
  const NO_FACE_FRAMES_THRESHOLD = 3;      // ~3 frames before "no face"
  const SAFE_ZONE_RATIO = 0.2;            // central 60% of frame = safe

  // 1️⃣ Get camera setting from backend
  useEffect(() => {
    const fetchTestCandidateData = async () => {
      try {
        const data = await getTestcandidateCameraApi(id);
        setIsCameraOn(data?.[0]?.is_camera_on || false);
      } catch (error) {
        console.error("Error fetching test candidate data:", error);
        setIsCameraOn(false);
      }
    };
    fetchTestCandidateData();
  }, [id]);

  // 2️⃣ Ask user permission
  useEffect(() => {
    if (isCameraOn && userConfirmed === null) {
      const confirmUserChoice = window.confirm(
        "This test uses AI proctoring (face, movement & mobile detection). Do you want to enable it?"
      );
      setUserConfirmed(confirmUserChoice);
      if (!confirmUserChoice) {
        navigate(-1);
      }
    }
  }, [isCameraOn, userConfirmed, navigate]);

  // 3️⃣ Load face-api + coco-ssd
  useEffect(() => {
    const loadModels = async () => {
      try {
        setModelError("");

        // face-api models (must be in /public/models)
        await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
        await faceapi.nets.faceLandmark68TinyNet.loadFromUri("/models");

        // coco-ssd from CDN (window.cocoSsd)
        if (window.cocoSsd && typeof window.cocoSsd.load === "function") {
          const loadedSsd = await window.cocoSsd.load();
          setSsdModel(loadedSsd);
          console.log("✅ coco-ssd model loaded");
        } else {
          console.warn("⚠️ coco-ssd not found on window. Check CDN script in index.html");
        }

        setModelsLoaded(true);
        console.log("✅ face-api models loaded");
      } catch (err) {
        console.error("Error loading AI models:", err);
        setModelError(
          "Could not load AI models. Please check that /public/models and CDN scripts are correct."
        );
        setModelsLoaded(false);
      }
    };

    if (isCameraOn && userConfirmed && !modelsLoaded && !modelError) {
      loadModels();
    }
  }, [isCameraOn, userConfirmed, modelsLoaded, modelError]);

  // 4️⃣ Main loop: analyze frame every 700ms (more real-time)
  useEffect(() => {
    if (!isCameraOn || !userConfirmed || !modelsLoaded) return;
    if (!webcamRef.current || !canvasRef.current) return;

    const interval = setInterval(() => {
      if (!detectionRunning) {
        analyzeFrame();
      }
    }, 700);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCameraOn, userConfirmed, modelsLoaded, detectionRunning]);

  // 🔔 Alert with cooldown
  const triggerAlert = (type, message) => {
    const now = Date.now();
    if (lastAlertType === type && now - lastAlertTime < ALERT_COOLDOWN_MS) {
      return;
    }
    setLastAlertType(type);
    setLastAlertTime(now);
    alert(message);
  };

  // 5️⃣ Analyze frame: faces + movement + zone + mobile
  const analyzeFrame = async () => {
    if (!webcamRef.current || !canvasRef.current) return;

    const video = webcamRef.current.video;
    if (!video || video.readyState !== 4) return;

    setDetectionRunning(true);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const videoWidth = video.videoWidth || 640;
    const videoHeight = video.videoHeight || 480;

    canvas.width = videoWidth;
    canvas.height = videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      // 👤 Face detection (on VIDEO, more reliable)
      const detections = await faceapi
        .detectAllFaces(
          video,
          new faceapi.TinyFaceDetectorOptions({
            inputSize: 320,
            scoreThreshold: 0.25, // more permissive
          })
        )
        .withFaceLandmarks(true);

      const faceCount = detections.length;
      console.log("Faces detected:", faceCount);

      if (faceCount === 0) {
        noFaceFramesRef.current += 1;
        if (noFaceFramesRef.current >= NO_FACE_FRAMES_THRESHOLD) {
          triggerAlert(
            "no-face",
            "Warning: No face detected. Please stay in front of the camera."
          );
          await suspiciousCapture("no_face");
        }
      } else {
        noFaceFramesRef.current = 0;
      }

      if (faceCount > 1) {
        triggerAlert(
          "multiple-face",
          "Alert: Multiple faces detected. Only one person should be in front of the camera."
        );
        await suspiciousCapture("multiple_face");
      } else if (faceCount === 1) {
        const detection = detections[0];
        const box = detection.detection.box;
        const landmarks = detection.landmarks;

        checkHeadDirection(detection, landmarks);
        checkMovementAndZone(box, videoWidth, videoHeight);
      }

      // 📱 Mobile phone detection
      await detectMobile(canvas);
    } catch (err) {
      console.error("Error during frame analysis:", err);
    } finally {
      setDetectionRunning(false);
    }
  };

  // 🧭 Head direction (left/right)
  const checkHeadDirection = (detection, landmarks) => {
    try {
      const nose = landmarks.getNose();
      const leftEye = landmarks.getLeftEye();
      const rightEye = landmarks.getRightEye();

      if (!nose.length || !leftEye.length || !rightEye.length) return;

      const nosePoint = nose[Math.floor(nose.length / 2)];
      const leftEyeCenter = avgPoint(leftEye);
      const rightEyeCenter = avgPoint(rightEye);

      const eyesCenterX = (leftEyeCenter.x + rightEyeCenter.x) / 2;
      const faceWidth = detection.detection.box.width;

      const offsetX = (nosePoint.x - eyesCenterX) / faceWidth;

      if (offsetX > HEAD_TURN_THRESHOLD_RATIO) {
        triggerAlert(
          "look-right",
          "Warning: You seem to be looking to the RIGHT. Please focus on the screen."
        );
        suspiciousCapture("look_right");
      } else if (offsetX < -HEAD_TURN_THRESHOLD_RATIO) {
        triggerAlert(
          "look-left",
          "Warning: You seem to be looking to the LEFT. Please focus on the screen."
        );
        suspiciousCapture("look_left");
      }
    } catch (err) {
      console.error("Error in head direction check:", err);
    }
  };

  const avgPoint = (points) => {
    const sum = points.reduce(
      (acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }),
      { x: 0, y: 0 }
    );
    return { x: sum.x / points.length, y: sum.y / points.length };
  };

  // 🚶 Movement + safe zone
  const checkMovementAndZone = (box, frameWidth, frameHeight) => {
    const center = {
      x: box.x + box.width / 2,
      y: box.y + box.height / 2,
    };

    const prev = prevFaceCenterRef.current;
    prevFaceCenterRef.current = center;

    // 1) Big movement detection (even slow accumulated movement)
    if (prev) {
      const dx = center.x - prev.x;
      const dy = center.y - prev.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > BIG_MOVE_THRESHOLD_PX) {
        triggerAlert(
          "big-move",
          "Warning: Movement detected. Please remain seated in front of the camera."
        );
        suspiciousCapture("big_movement");
      }
    }

    // 2) Safe zone detection (must stay roughly center of frame)
    const padX = frameWidth * SAFE_ZONE_RATIO;   // 20% on each side
    const padY = frameHeight * SAFE_ZONE_RATIO;  // 20% top/bottom

    const minX = padX;
    const maxX = frameWidth - padX;
    const minY = padY;
    const maxY = frameHeight - padY;

    const outOfZone =
      center.x < minX ||
      center.x > maxX ||
      center.y < minY ||
      center.y > maxY;

    if (outOfZone) {
      triggerAlert(
        "out-zone",
        "Warning: You are moving out of the allowed camera area. Please stay centered."
      );
      suspiciousCapture("out_of_zone");
    }
  };

  // 📱 Mobile phone detection using coco-ssd
  const detectMobile = async (canvas) => {
    if (!ssdModel) return;

    try {
      const predictions = await ssdModel.detect(canvas);
      const hasPhone = predictions.some(
        (p) => p.class === "cell phone" && p.score > 0.5
      );

      if (hasPhone) {
        console.log("📱 Mobile detected", predictions);
        triggerAlert(
          "mobile",
          "Alert: Mobile phone detected in the camera view. Using mobile is not allowed."
        );
        await suspiciousCapture("mobile_phone");
      }
    } catch (err) {
      console.error("Error in mobile detection:", err);
    }
  };

  // 📸 Suspicious screenshot with cooldown
  const suspiciousCapture = async (reason) => {
    const now = Date.now();
    if (now - lastCaptureTime < SCREENSHOT_COOLDOWN_MS) return;

    setLastCaptureTime(now);
    captureScreenshot(reason);
  };

  const captureScreenshot = (reason = "generic") => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setScreenshots((prev) => {
          const updatedScreenshots = [...prev, imageSrc].slice(-3);
          return updatedScreenshots;
        });
        uploadScreenshot(imageSrc, reason);
      }
    }
  };

  const uploadScreenshot = async (imageSrc, reason) => {
    try {
      const formData = new FormData();
      const blob = await imageSrcToBlob(imageSrc);
      formData.append("screenshots", blob, `screenshot_${reason}.jpg`);
      formData.append("reason", reason);

      if (screenshots.length < 3) {
        await addCameraScreenshots_API(id, formData);
      }
    } catch (error) {
      console.error("Error uploading screenshot:", error);
    }
  };

  const imageSrcToBlob = (imageSrc) => {
    return fetch(imageSrc).then((res) => res.blob());
  };

  return (
    <div>
      {isCameraOn && userConfirmed && (
        <div>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={{ width: 640, height: 480, facingMode: "user" }}
            style={{ width: "320px", height: "240px", borderRadius: "8px" }}
          />
          <canvas ref={canvasRef} style={{ display: "none" }} />

          <div style={{ marginTop: "10px", fontSize: "12px", color: "#666" }}>
            {modelError && <span style={{ color: "red" }}>{modelError}</span>}
            {!modelError && (
              <>
                {modelsLoaded
                  ? "AI proctoring is active (face, movement & mobile detection)."
                  : "Loading AI models..."}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraComponent;
