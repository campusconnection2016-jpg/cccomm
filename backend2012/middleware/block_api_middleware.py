# middleware/block_api_middleware.py
from django.http import JsonResponse
import logging

logger = logging.getLogger(__name__)  # use Django's logging

ALLOWED_ORIGINS = [
    "http://ccportal.co.in",
    "https://ccportal.co.in",
    "http://localhost:3000",
    "http://127.0.0.1:8000",
]

class BlockUnauthorizedAPI:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.path.startswith("/api/"):
            origin = request.headers.get("Origin")
            referer = request.headers.get("Referer")
            client_ip = self.get_client_ip(request)

            # 🚫 Direct browser hits (no headers)
            if not origin and not referer:
                msg = f"❌ Direct API hit blocked | IP: {client_ip} | Path: {request.path}"
                logger.warning(msg)
                print(msg)   # 👈 immediate feedback in dev server
                return JsonResponse({"error": "Direct API access blocked"}, status=403)

            # 🚫 Block unauthorized origins/referers
            if (origin and origin not in ALLOWED_ORIGINS) or \
               (referer and not referer.startswith(tuple(ALLOWED_ORIGINS))):
                msg = (
                    f"❌ Unauthorized API access blocked | "
                    f"IP: {client_ip} | Path: {request.path} | "
                    f"Origin: {origin} | Referer: {referer}"
                )
                logger.warning(msg)
                print(msg)   # 👈 immediate feedback in dev server
                return JsonResponse({"error": "Unauthorized API access"}, status=403)

        return self.get_response(request)

    def get_client_ip(self, request):
        """Helper to extract client IP address"""
        x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
        if x_forwarded_for:
            ip = x_forwarded_for.split(",")[0]
        else:
            ip = request.META.get("REMOTE_ADDR")
        return ip
