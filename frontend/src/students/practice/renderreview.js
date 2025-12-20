import React, { useState } from "react";
import Next from "../../assets/images/next.png";
import Back from "../../assets/images/back.png";

// BinaryToImages Component
const BinaryToImages = ({ binaryData, width, height }) => {
  const base64Image = `data:image/png;base64,${binaryData}`;
  return (
    <img
      src={base64Image}
      width={width}
      height={height}
      alt="option-image"
    />
  );
};

const RenderReviewSection = ({ questions, answers }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const questionsPerPage = 1;

  console.log("📌 Incoming questions:", questions);
  console.log("📌 Incoming answers map:", answers);

  const nextPage = () => {
    if ((currentPage + 1) * questionsPerPage < questions.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const renderedQuestion = questions[currentPage];

// Lookup by question_text instead of id
const answerData = answers[renderedQuestion.question_text] || {};
const submittedAnswer = answerData.submitted || null;
const correctAnswer = answerData.correct || renderedQuestion.answer;
const explanation = renderedQuestion.explain_answer|| answerData.explanation ;
  console.log(
    `🔍 Lookup for question (id: ${renderedQuestion.id}, `,
    submittedAnswer, 
  );
console.log("explanation",`${renderedQuestion.id}`,explanation)
  const getOptionText = (question, option) => {
    switch (option) {
      case "A":
        return (
          <>
            {question.option_a}
            {question.option_a_image_data && (
              <BinaryToImages
                binaryData={question.option_a_image_data}
                width="60px"
                height="60px"
              />
            )}
          </>
        );
      case "B":
        return (
          <>
            {question.option_b}
            {question.option_b_image_data && (
              <BinaryToImages
                binaryData={question.option_b_image_data}
                width="60px"
                height="60px"
              />
            )}
          </>
        );
      case "C":
        return (
          <>
            {question.option_c}
            {question.option_c_image_data && (
              <BinaryToImages
                binaryData={question.option_c_image_data}
                width="60px"
                height="60px"
              />
            )}
          </>
        );
      case "D":
        return (
          <>
            {question.option_d}
            {question.option_d_image_data && (
              <BinaryToImages
                binaryData={question.option_d_image_data}
                width="60px"
                height="60px"
              />
            )}
          </>
        );
      default:
        return "";
    }
  };

  return (
    <div
      style={{
        padding: "10px",
        border: "1px solid white",
        width: "100%",
        boxSizing: "border-box",
        boxShadow: "0 8px 16px 0 rgba(0, 0, 0, 0.2)",
      }}
    >
      <div key={renderedQuestion.id}>
        <h6>
          <strong>
            {currentPage + 1}) {renderedQuestion.question_text}
          </strong>
        </h6>

        {renderedQuestion.question_image_data && (
          <div>
            <BinaryToImages
              binaryData={renderedQuestion.question_image_data}
              width="200px"
              height="200px"
            />
          </div>
        )}

       <h6>
  <strong>
    Correct Answer: {getOptionText(renderedQuestion, correctAnswer)}
  </strong>
</h6>

<p
  style={{
    fontSize: "15px",
    color: submittedAnswer === correctAnswer ? "#DDFB35" : "#FF474c",
  }}
>
  Submitted Answer:{" "}
  {submittedAnswer
    ? getOptionText(renderedQuestion, submittedAnswer)
    : "Not Answered"}
</p>

        <p>Explanation: {explanation || "No explanation provided"}</p>

      </div>

      <div>
        <div
          onClick={prevPage}
          style={{
            border: "none",
            background: "none",
            cursor: currentPage === 0 ? "not-allowed" : "pointer",
          }}
        >
          <img src={Back} alt="Back" style={{ width: "30px", height: "30px" }} />
        </div>
        <div
          onClick={nextPage}
          style={{
            border: "none",
            background: "none",
            cursor:
              currentPage === questions.length - 1 ? "not-allowed" : "pointer",
            float: "right",
            marginTop: "-30px",
          }}
        >
          <img src={Next} alt="Next" style={{ width: "30px", height: "30px" }} />
        </div>
      </div>
    </div>
  );
};

const CombinedReviewSection = ({ questions, answers }) => {
  console.log("🔥 CombinedReviewSection received props:", {
    questions,
    answers,
  });
  return <RenderReviewSection questions={questions} answers={answers} />;
};

export default CombinedReviewSection;
