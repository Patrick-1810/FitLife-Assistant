import base64
import ollama
from PIL import Image
import io

OCR_MODEL = "llava"

NUTRITION_PROMPT = (
    "Look at this image and describe exactly what food items, dishes, and ingredients you can see. "
    "Be specific: list every food item visible, describe the plate composition, and estimate the portion sizes if possible. "
    "Only describe what you literally see in the image. Do not refuse."
)

GENERIC_PROMPT = (
    "Extraia e retorne todo o texto visível nesta imagem de forma organizada em português. "
    "Mantenha a estrutura original quando possível."
)


def image_to_base64(image_bytes: bytes) -> str:
    return base64.b64encode(image_bytes).decode("utf-8")


def validate_image(image_bytes: bytes) -> bytes:
    img = Image.open(io.BytesIO(image_bytes))
    img.verify()
    # Re-open after verify (verify closes the file)
    img = Image.open(io.BytesIO(image_bytes))
    if img.mode not in ("RGB", "RGBA", "L"):
        img = img.convert("RGB")
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()


def run_ocr(image_bytes: bytes, nutrition_mode: bool = False) -> str:
    image_bytes = validate_image(image_bytes)
    image_b64 = image_to_base64(image_bytes)
    prompt = NUTRITION_PROMPT if nutrition_mode else GENERIC_PROMPT

    response = ollama.generate(
        model=OCR_MODEL,
        prompt=prompt,
        images=[image_b64],
    )
    return response["response"].strip()
