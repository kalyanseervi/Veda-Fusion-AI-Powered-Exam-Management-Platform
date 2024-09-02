# questions/urls.py
from django.urls import path
from .views import GenerateMCQView

urlpatterns = [
    path("generate/", GenerateMCQView.as_view(), name="generate_question"),

]
