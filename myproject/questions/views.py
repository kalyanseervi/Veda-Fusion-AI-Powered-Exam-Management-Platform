from django.views.decorators.csrf import csrf_exempt
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.http import JsonResponse, StreamingHttpResponse
import fitz  # PyMuPDF
import logging
import google.generativeai as genai
import json

logger = logging.getLogger(__name__)


api_key = "AIzaSyCwzeQSB_vybOUwMvF_GBIDujIGIv_TXKI"  # Replace with the actual secure method for API keys





class GenerateMCQView(APIView):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-1.5-flash")
        self.model = model

    def generate_with_modified_first_chunk(self, generator):
        first_chunk = True
        buffer = ""

        for chunk in generator:
            if first_chunk:
                # Process the first chunk to remove the first 6 characters
                buffer += chunk
                if len(buffer) > 7:
                    yield buffer[
                        7:
                    ]  # Yield the modified chunk without the first 6 characters
                    buffer = ""  # Reset buffer after yielding
                    first_chunk = False
            else:
                yield chunk

    def create_mcq_from_topic(
        self,
        School_class,
        subject,
        topic,
        question_types,
        difficulty_levels,
        curriculum_alignment,
        real_world_relevance,
        visual_aids,
        
    ):
        prompt = (
            f"Generate Questions based on the following details you must follow my question types(if there is count greater then 0) :\n"
            f"School class: {School_class} th\n"
            f"Topics: {topic}\n"  # No need to use json.dumps if topic is already a string
            f"Subject: {subject}\n"
            f"Question Types: {json.dumps(question_types)}\n"
            f"Difficulty Level: {difficulty_levels}\n"  # Assuming difficulty_levels is a string like 'easy'
            f"Curriculum Alignment: {curriculum_alignment}\n"
            f"Real World Relevance: {'Yes' if real_world_relevance else 'No'}\n"
            f"Visual Aids: {'Yes' if visual_aids else 'No'}\n"
          
            f"response format: {'json format in well structured without any other symbols and other text'}\n"
            f"Ensure that each question is unique and formatted correctly. Return the response in JSON data "
            f"with fields for Questions('question', 'options','answer','marks''questions type(according to given prompt question type)'.)"
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
        School_class,
        subject,
        text,
        question_types,
        difficulty_levels,
        curriculum_alignment,
        real_world_relevance,
        visual_aids,
      
        question_bank,
    ):
        prompt = (
            f"Generate questions based on the provided text with the following details you must follow my question types(if there is count greater then 0 thne dont generate questions on that type)\n"
            f"School class: {School_class} th\n"
            f"Text: {text}\n"
            f"Subject: {subject}\n"
            f"Question Types: {json.dumps(question_types)}\n"
            f"Difficulty Levels: {json.dumps(difficulty_levels)}\n"
            f"Curriculum Alignment: {curriculum_alignment}\n"
            f"Real World Relevance: {'Yes' if real_world_relevance else 'No'}\n"
            f"Visual Aids: {'Yes' if visual_aids else 'No'}\n"
          
            f"question bank: {question_bank}\n"
            f"response format: {'json format in well structured without any other symbols and other text'}\n"
            f"Ensure that each question is unique and formatted correctly. Return the response in JSON data "
            f"with fields for json is  Questions('question', 'options','answer','marks''questins type(according to given prompt question type)'.)"
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
        
        prompt_data = {
            "School_class": request.data.get("class", "").strip(),
            "subject": request.data.get("subject", "").strip(),
            "topics": request.data.get("topics", ""),
            "pdf_input": request.data.get("pdfInput", None),
            "question_types": {
                "mcq": {
                    "count": request.data.get("questionTypes[mcq][count]", 0),
                    "marks": request.data.get("questionTypes[mcq][marks]", 0),
                },
                "short_answer": {
                    "count": request.data.get("questionTypes[short_answer][count]", 0),
                    "marks": request.data.get("questionTypes[short_answer][marks]", 0),
                    "word_count": 30,
                },
                "long_answer": {
                    "count": request.data.get("questionTypes[long_answer][count]", 0),
                    "marks": request.data.get("questionTypes[long_answer][marks]", 0),
                    "word_count": 500,
                },
                "yes_no": {
                    "count": request.data.get("questionTypes[yes_no][count]", 0),
                    "marks": request.data.get("questionTypes[yes_no][marks]", 0),
                },
                "fill_in_the_blanks": {
                    "count": request.data.get(
                        "questionTypes[fill_in_the_blanks][count]", 0
                    ),
                    "marks": request.data.get(
                        "questionTypes[fill_in_the_blanks][marks]", 0
                    ),
                },
            },
            "difficulty_levels": request.data.get("difficulty_levels", "easy").strip(),
            "total_marks": request.data.get("total_marks", 0),
            "curriculum_alignment": request.data.get(
                "curriculum_alignment", ""
            ).strip(),
            "real_world_relevance": request.data.get("real_world_relevance", True),
            "visual_aids": request.data.get("visual_aids", True),
            "question_bank": request.data.get("question_bank", True),
            
        }
        

        
        logger.info(f"Received prompt data: {prompt_data}")

        if prompt_data["pdf_input"]:
            pdf_file = request.FILES.get("pdfInput")
           
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
                prompt_data["School_class"],  # class
                prompt_data["subject"],  # subject
                prompt_data["topics"],  # topic
                prompt_data["question_types"],  # question_types
                prompt_data["difficulty_levels"],  # difficulty_levels
                prompt_data["curriculum_alignment"],  # curriculum_alignment
                prompt_data["real_world_relevance"],  # real_world_relevance
                prompt_data["visual_aids"],  # visual_aids
               
            )
        elif chapter_text:
            generator = self.create_mcq_from_text(
                chapter_text,
                prompt_data["School_class"],  # class
                prompt_data["subject"],  # subject
                prompt_data["question_types"],
                prompt_data["difficulty_levels"],
                prompt_data["curriculum_alignment"],
                prompt_data["real_world_relevance"],
                prompt_data["visual_aids"],
               
                prompt_data["question_bank"],
            )
        else:
            return Response(
                {"error": "Either topics or pdfFile/chapterText is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        def response_stream():
            chunks = []
            try:
                # Collect all chunks first without cleaning
                for chunk in generator:
                    chunks.append(chunk)  # Collect all chunks into a list
                    yield chunk  # Stream the raw chunk to the client progressively

                # Combine all chunks into a single response
                full_response = "".join(chunks)

                # Clean the final combined response once (remove backticks, etc.)
                cleaned_full_response = (
                    full_response.replace("```json", "").replace("```", "").strip()
                )

                try:
                    # Parse the cleaned response as JSON to ensure it's valid
                    json_response = json.loads(cleaned_full_response)

                    # Stream the final structured JSON response
                    # yield json.dumps({
                    #     "status": "completed",
                    #     "questions": json_response
                    # })
                except json.JSONDecodeError as e:
                    logger.error(f"Error parsing generated response: {e}")
                    yield json.dumps({"error": "Error generating structured JSON"})

            except Exception as e:
                logger.error(f"Error generating MCQs: {e}")
                yield json.dumps({"error": str(e)})

        # Stream the chunks followed by the final cleaned JSON response
        response = StreamingHttpResponse(
            response_stream(), content_type="application/json"
        )
        response["Cache-Control"] = "no-cache"
        response["Content-Disposition"] = 'inline; filename="mcqs.json"'

        return response



class Evaluate(APIView):

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-1.5-flash")
        self.model = model

    def post(self, request, *args, **kwargs):
        # Parse the JSON request body
        try:
            data = json.loads(request.body)
           
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)

        question = data.get("question")
        user_answer = data.get("answer")
        max_marks = data.get("max_marks", 0)

        if not question:
            return JsonResponse({"error": "Question and answer are required"}, status=400)

        # Validate the answer
        is_correct, awarded_marks, explanation = self.validate_answer(question, user_answer, max_marks)
        

        return JsonResponse({
            "isCorrect": is_correct,
            "awardedMarks": awarded_marks,
            "explanation": explanation
        })

    def validate_answer(self, question, user_answer, max_marks):
        # Create a more detailed prompt for evaluating the answer
        prompt = (
            f"Question: {question}\n"
            f"User Answer: {user_answer}\n"
            f"Max Marks: {max_marks}\n"
            f"my reponse is must in json format and field is result(is_correct, awarded_marks, explanation) follow this format"
            f"Evaluate the answer. Respond with 'true' if the answer is correct or 'false' if incorrect, "
            f"along with the awarded marks out of {max_marks}. also check answer according to my mar_marks weightage"
            f"Also provide a detailed explanation of why the marks were awarded and why not."
        )

        try:
            # Use the model to evaluate the answer
            response = self.model.generate_content(prompt, stream=False)

            # Clean the response text by removing backticks and any other unwanted characters
            if response.text:
                cleaned_text = response.text.strip().replace("```", "")  # Remove backticks

                # Remove 'json' string if it appears in the response
                if cleaned_text.startswith('json'):
                    cleaned_text = cleaned_text[4:].strip()  # Remove the 'json' keyword

                
                # Try to parse the cleaned response as JSON
                try:
                    json_response = json.loads(cleaned_text)
                    
                    # Extract correctness, marks, and explanation from the JSON result
                    result = json_response.get("result", {})
                    correctness = result.get("is_correct", False)
                    awarded_marks = result.get("awarded_marks", 0)
                    explanation = result.get("explanation", "No explanation available")
                    

                    # Return the extracted values
                    return correctness, awarded_marks, explanation
                except json.JSONDecodeError:
                    # Handle the case where the API response is not valid JSON
                    print("Invalid JSON received from Gemini API.")
                    return False, 0, "No explanation available."

            else:
                print("No valid response found from the API.")
                return False, 0, "No explanation available."

        except Exception as e:
            print(f"Error using Gemini API: {e}")
            return False, 0, "Error evaluating the answer."




