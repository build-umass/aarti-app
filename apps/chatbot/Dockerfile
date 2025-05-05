FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

# RUN apt-get update && apt-get install -y --no-install-recommends <any-system-libs-needed> && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

ENV CHROMA_HOST=chromadb
ENV CHROMA_PORT=8000
ENV SENTENCE_TRANSFORMERS_HOME=/app/.cache/sentence_transformers

CMD ["python", "app.py"]