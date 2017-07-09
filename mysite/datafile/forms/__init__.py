from django import forms
# from django.core.exceptions import ValidationError
# from distribution.models import Feeder
from django.utils.safestring import mark_safe

class UploadGLMForm(forms.Form):
    feeder_name = forms.CharField(max_length=50, help_text=mark_safe("input a <b>UNIQUE</b> feeder name<br/> (e.g. PG_CASE_123)"))
    glm_file = forms.FileField()
    def clean_feeder_name(self):
        feederName = self.cleaned_data['feeder_name']
        # print 'checking valid data for subject ', data
        # if Feeder.objects.filter(name=feederName).exists():
        #     raise ValidationError("Feeder Name Exists, please input a Unique Name")
        return feederName

