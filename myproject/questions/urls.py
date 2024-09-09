# questions/urls.py
from django.urls import path
from .views import GenerateMCQView,Evaluate

urlpatterns = [
    path("generate/", GenerateMCQView.as_view(), name="generate_question"),
    path("evaluate/", Evaluate.as_view(), name="evaluate"),

]
