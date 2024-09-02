from django.views.decorators.csrf import csrf_exempt
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.http import StreamingHttpResponse
import fitz  # PyMuPDF
import logging
import google.generativeai as genai
import json

logger = logging.getLogger(__name__)


class GenerateMCQView(APIView):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        api_key = "AIzaSyCwzeQSB_vybOUwMvF_GBIDujIGIv_TXKI"  # Replace with the actual secure method for API keys
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel("gemini-1.5-flash")


    def generate_with_modified_first_chunk(self, generator):
        first_chunk = True
        buffer = ""

        for chunk in generator:
            if first_chunk:
                # Process the first chunk to remove the first 6 characters
                buffer += chunk
                if len(buffer) > 7:
                    yield buffer[7:]  # Yield the modified chunk without the first 6 characters
                    buffer = ""  # Reset buffer after yielding
                    first_chunk = False
            else:
                yield chunk

    def create_mcq_from_topic(
        self,
        topic,
        question_types,
        difficulty_levels,
        curriculum_alignment,
        real_world_relevance,
        visual_aids,
        time_constraints,
    ):
        prompt = (
            f"Generate multiple-choice questions based on the following details:\n"
            f"Topics: {topic}\n"  # No need to use json.dumps if topic is already a string
            f"Question Types: {json.dumps(question_types)}\n"
            f"Difficulty Level: {difficulty_levels}\n"  # Assuming difficulty_levels is a string like 'easy'
            f"Curriculum Alignment: {curriculum_alignment}\n"
            f"Real World Relevance: {'Yes' if real_world_relevance else 'No'}\n"
            f"Visual Aids: {'Yes' if visual_aids else 'No'}\n"
            f"Time Constraints: {time_constraints} minutes\n"
            f"Ensure that each question is unique, appropriately challenging, and formatted correctly. "
            f"Return the response in JSON format with fields for 'question', 'options' (for MCQs), and 'answer'."
        )
        try:
            response = self.model.generate_content(prompt, stream=True)
            for chunk in response:
                yield chunk.text  # Yield each chunk of text as it's generated
        except Exception as e:
            logger.error(f"Error generating MCQs from topic: {e}")
            yield json.dumps({"error": str(e)})

    def create_mcq_from_text(
        self,
        text,
        question_types,
        difficulty_levels,
        curriculum_alignment,
        real_world_relevance,
        visual_aids,
        time_constraints,
        question_bank,
    ):
        prompt = (
            f"Generate questions based on the provided text '{text}' with the following details:\n"
            f"Question Types: {json.dumps(question_types)}\n"
            f"Difficulty Levels: {json.dumps(difficulty_levels)}\n"
            f"Curriculum Alignment: {curriculum_alignment}\n"
            f"Real World Relevance: {'Yes' if real_world_relevance else 'No'}\n"
            f"Visual Aids: {'Yes' if visual_aids else 'No'}\n"
            f"Time Constraints: {time_constraints}\n"
            f"question bank: {question_bank}\n"
            f"response format: {'json format in well structured without any other symbols and other text'}\n"
            f"Ensure that each question is unique and formatted correctly. Return the response in JSON data "
            f"with fields for 'question', 'options', and 'answer'."
        )
        try:
            response = self.model.generate_content(prompt, stream=True)
            for chunk in response:
                yield chunk.text
        except Exception as e:
            logger.error(f"Error generating MCQs from text: {e}")
            yield f"Error generating MCQs: {e}"

    def extract_text_from_pdf(self, pdf_path):
        doc = fitz.open(pdf_path)
        text = ""
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            text += page.get_text()
        doc.close()
        return text.strip()

    def post(self, request):
        # Extract data from request
        print(request.data)
        prompt_data = {
            "class": request.data.get("class", "").strip(),
            "subject": request.data.get("subject", "").strip(),
            "topics": request.data.get(
                "topics", ""
            ),  # Ensure topics is treated as a string if it comes as a string
            "pdf_input": request.data.get(
                "pdfInput", None
            ),  # Use camelCase to match the form control name
            "question_types": {
                "mcq": {
                    "count": request.data.get("questionTypes[mcq][count]", {}),
                    "marks": request.data.get("questionTypes[mcq][marks]", {}),
                },
                "short_answer": {
                    "count": request.data.get("questionTypes[short_answer][count]", {}),
                    "marks": request.data.get("questionTypes[short_answer][marks]", {}),
                    "word_count":30
                },
                "long_answer": {
                    "count": request.data.get("questionTypes[long_answer][count]", {}),
                    "marks": request.data.get("questionTypes[long_answer][marks]", {}),
                     "word_count":500
                },
                "yes_no": {
                    "count": request.data.get("questionTypes[yes_no][count]", {}),
                    "marks": request.data.get("questionTypes[yes_no][marks]", {}),
                },
                "fill_in_the_blanks": {
                    "count": request.data.get("questionTypes[fill_in_the_blanks][count]", {}),
                    "marks": request.data.get("questionTypes[fill_in_the_blanks][marks]", {}),
                },
            },
            "difficulty_levels": request.data.get(
                "difficulty_levels", "easy"
            ).strip(),  # Default value matches form
            "total_marks": request.data.get("total_marks", 0),
            "curriculum_alignment": request.data.get(
                "curriculum_alignment", ""
            ).strip(),
            "real_world_relevance": request.data.get("real_world_relevance", True),
            "visual_aids": request.data.get("visual_aids", True),
            "question_bank": request.data.get("question_bank", True),
            "time_constraints": request.data.get("time_constraints", "120").strip(),

        }

        print(prompt_data)
        logger.info(f"Received prompt data: {prompt_data}")

        if prompt_data["pdf_input"]:
            pdf_file = request.FILES.get("pdfFile")
            if not pdf_file:
                return Response(
                    {"error": "PDF file is required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            file_name = default_storage.save(
                pdf_file.name, ContentFile(pdf_file.read())
            )
            file_path = default_storage.path(file_name)

            try:
                chapter_text = self.extract_text_from_pdf(file_path)
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
            finally:
                if default_storage.exists(file_path):
                    default_storage.delete(file_path)
        else:
            chapter_text = request.data.get("chapterText", "").strip()

        # Determine the generator function to use
        if prompt_data["topics"]:
            generator = self.create_mcq_from_topic(
                prompt_data["topics"],
                prompt_data["question_types"],
                prompt_data["difficulty_levels"],
                prompt_data["curriculum_alignment"],
                prompt_data["real_world_relevance"],
                prompt_data["visual_aids"],
                prompt_data["time_constraints"],
            )
        elif chapter_text:
            generator = self.create_mcq_from_text(
                chapter_text,
                prompt_data["question_types"],
                prompt_data["difficulty_levels"],
                prompt_data["curriculum_alignment"],
                prompt_data["real_world_relevance"],
                prompt_data["visual_aids"],
                prompt_data["time_constraints"],
            )
        else:
            return Response(
                {"error": "Either topics or pdfFile/chapterText is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        response_generator = self.generate_with_modified_first_chunk(generator)
        response = StreamingHttpResponse(response_generator, content_type="application/json")
        response["Cache-Control"] = "no-cache"
        response["Content-Disposition"] = 'inline; filename="mcqs.json"'

        return response
