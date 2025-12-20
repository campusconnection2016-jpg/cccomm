# forms.py
from django import forms
from .models import question_master,company_login, college_master,department_master, eligible_student_list,Screenshots,login,trainer_master,candidate_master,comman_announcement
from django import forms

class QuestionImportForm(forms.Form):
    docx_file = forms.FileField()
    def clean_docx_file(self):
        file = self.cleaned_data['docx_file']
        valid_mime_types = ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/pdf']
        valid_extensions = ['.docx', '.pdf']

        if file.content_type not in valid_mime_types:
            raise forms.ValidationError("Unsupported file type. Please upload a .docx or .pdf file.")

        if not any(file.name.lower().endswith(ext) for ext in valid_extensions):
            raise forms.ValidationError("File must have a .docx or .pdf extension.")

        return file

class DocumentForm(forms.Form):
    docfile = forms.FileField()
    def clean_docfile(self):
        file = self.cleaned_data.get('docfile')
        if file and not file.name.endswith(('.docx', '.pdf')):
            raise forms.ValidationError("Only .docx and .pdf files are supported.")
        return file

class QuestionForm(forms.ModelForm):
    question_image_data = forms.FileField(required=False)
    option_a_image_data = forms.FileField(required=False)
    option_b_image_data = forms.FileField(required=False)
    option_c_image_data = forms.FileField(required=False)
    option_d_image_data = forms.FileField(required=False)
    option_e_image_data = forms.FileField(required=False)

    class Meta:
        model = question_master
        fields = ['id',
                  'question_name_id' ,
                  'question_text',
                                   
                  'option_a', 
                  'option_b', 
                  'option_c', 
                  'option_d', 
                  'option_e',
                  'mark_method',
                  'answer', 
                  'negative_mark',
                  'mark',
                  'explain_answer', 
                  'sections',
                  'difficulty_level'
                  
                 ]
        

class QuestionCodeForm(forms.ModelForm):
    question_image_data = forms.FileField(required=False)
   
    class Meta:
        model = question_master
        fields = ['id',
                  'question_name_id' ,
                  'question_text',
                   'answer', 
                  'negative_mark',
                  'mark',
                  'explain_answer', 
                  'input_format',
                   'difficulty_level'
                  
                 ]


class EligibleStudentListForm(forms.ModelForm):
    announcement_image = forms.FileField(required=False)

    class Meta:
        model = eligible_student_list
        fields = ['announcement']

class QuestionFormMCQ(forms.ModelForm):
    question_image_data = forms.FileField(required=False)
    option_a_image_data = forms.FileField(required=False)
    option_b_image_data = forms.FileField(required=False)
    option_c_image_data = forms.FileField(required=False)
    option_d_image_data = forms.FileField(required=False)
    option_e_image_data = forms.FileField(required=False)
    class Meta:
        model = question_master
        fields = ['id',
                  'question_text',
                  'option_a', 
                  'option_b', 
                  'option_c', 
                  'option_d', 
                  'option_e',
                  'mark_method',
                  'answer', 
                  'mark',
                  'sections',
                   'difficulty_level'
                 ]



class ScreenshotsForm(forms.ModelForm):
    screenshots = forms.FileField(required=False)
   
    class Meta:
        model = Screenshots
        fields = ['id',
                  'test_candidate_id',
                  
                 ]

class TrainerMasterForm(forms.ModelForm):
    photo = forms.FileField(required=False)  # File upload for BinaryField
    resume = forms.FileField(required=False)  # File upload for FileField

    class Meta:
        model = trainer_master
        fields = [
           
            'trainer_name', 'location', 'certification', 'pan_number', 'gst',
           'experience','qualification', 'is_active',
            'state', 'city', 'mobile_no', 'email_id', 'skill_id',
            'languages_known', 'bank_name', 'ifsc_code', 'branch_name',
            'account_no',  'user_name','address','remarks'
        ]


class CCAnnouncementForm(forms.ModelForm):
   # announcement_image = forms.FileField(required=False)
    role = forms.ChoiceField(choices=[])  # We'll dynamically populate this in the form's init method

    class Meta:
        model = comman_announcement
        fields = ['announcement']  # Only include the announcement field, no need for login_id or announcement_image

    def __init__(self, *args, **kwargs):
        super(CCAnnouncementForm, self).__init__(*args, **kwargs)
        # Populate the role choices dynamically from the Login model
        roles = login.objects.values_list('role', flat=True).distinct()
        self.fields['role'].choices = [(role, role) for role in roles]

class PlacementAnnouncementForm(forms.ModelForm):
    role = forms.ChoiceField(choices=[('', 'None')], required=False)  # Add "None" as a valid option
    candidate_id = forms.ModelChoiceField(queryset=candidate_master.objects.none(), required=False)

    class Meta:
        model = comman_announcement
        fields = ['announcement', 'candidate_id']

    def __init__(self, *args, **kwargs):
        super(PlacementAnnouncementForm, self).__init__(*args, **kwargs)
        
        # Populate role choices dynamically from the login model
        roles = login.objects.values_list('role', flat=True).distinct()
        self.fields['role'].choices += [(role, role) for role in roles]  # Add the fetched roles dynamically
        
        # Populate candidate_id dynamically from candidate_master model
        self.fields['candidate_id'].queryset = candidate_master.objects.all()

    def clean(self):
        cleaned_data = super().clean()

        # Ensure either candidate_id or role is selected
        candidate_id = cleaned_data.get('candidate_id')
        role = cleaned_data.get('role')

        if not candidate_id and not role:
            raise forms.ValidationError("Either candidate or role must be selected.")
        
        # If the role is set to 'None' (''), treat it as not being selected
        if role == '':
            cleaned_data['role'] = None
        
        return cleaned_data

#----------------------------new changes------------------------------------#

class CollegeForm(forms.ModelForm):
    college_logo = forms.FileField(required=False)
   
    class Meta:
        model = college_master
        fields = ['id',
                  'college',
                 
                   'college_group',
                 
                   'spoc_name',
                   'level_of_access',
                   'spoc_no',
                   'email'
                 ]
     
class AnnouncementUpdateForm(forms.Form):
    ids = forms.JSONField()  # Expecting a JSON array of integers
    announcement = forms.CharField(required=False)
    announcement_image = forms.ImageField(required=False)

    def clean_ids(self):
        ids = self.cleaned_data['ids']
        
        # Flatten and validate ids
        if any(isinstance(i, list) for i in ids):
            ids = [item for sublist in ids for item in sublist]
        if not all(isinstance(i, int) for i in ids):
            raise forms.ValidationError("All IDs must be integers.")
        
        return ids


class CompanyForm(forms.ModelForm):
    company_logo = forms.FileField(required=False)
    college_id = forms.ModelMultipleChoiceField(
        queryset=college_master.objects.all(),
        required=False,
        widget=forms.CheckboxSelectMultiple  # Optional: change widget as needed
    )
    class Meta:
        model = company_login
        fields = ['id',
                  'company_name',
                   'company_profile',
                  'user_name',
                  'email_id',
                  'mobile_no',
                  'password','college_id'
                  
                 ]



from django.forms import DateInput


class CollegeFormUpdate(forms.ModelForm):
    college_logo = forms.FileField(required=False)
    #remarks_file = forms.FileField(required=False) 

    class Meta:
        model = college_master
        fields = [
            'college',
            'college_group',
            'spoc_name',
            'spoc_no',
            'email',
            'stay_incharge_name',
            'stay_incharge_no',
            'trans_incharge_name',
            'trans_incharge_no',
            'level_of_access'
        ]

class CandidateUpdateForm(forms.ModelForm):
    resume = forms.FileField(required=False)  # Upload Resume
    photo = forms.FileField(required=False)   # Upload Photo

    class Meta:
        model = candidate_master
        fields = ['resume', 'photo']  # Only uploading files, not links


import json
from .models import training_schedule_temp

class TrainerDateForm(forms.ModelForm):
    class Meta:
        model = training_schedule_temp
        fields = ['trainer_date']
        widgets = {
            'trainer_date': forms.Textarea(),  # Allow free-form JSON input
        }

    def clean_trainer_date(self):
        trainer_date_raw = self.cleaned_data['trainer_date']

        # If already a dict, return as is
        if isinstance(trainer_date_raw, dict):
            return trainer_date_raw

        # If string, attempt to parse as JSON
        try:
            trainer_date_json = json.loads(trainer_date_raw)
            if not isinstance(trainer_date_json, dict):
                raise forms.ValidationError("Trainer date must be a JSON object (dictionary).")
            return trainer_date_json
        except Exception as e:
            raise forms.ValidationError(f"Invalid JSON: {str(e)}")

from django import forms
from app.models import training_schedule_temp, college_master, candidate_master, department_master
from django.core.exceptions import ObjectDoesNotExist

class TrainingScheduleFormUpdate(forms.ModelForm):
    year_choices = [(1, '1'), (2, '2'), (3, '3'), (4, '4')]

    department_id = forms.ModelMultipleChoiceField(
        queryset=department_master.objects.all(),
        widget=forms.CheckboxSelectMultiple,
        required=False
    )

    year = forms.MultipleChoiceField(
        choices=year_choices,
        widget=forms.CheckboxSelectMultiple,
        required=False
    )

    batches = forms.MultipleChoiceField(
        choices=[],
        required=False,
        widget=forms.SelectMultiple(attrs={'size': '6'})
    )

    trainers = forms.MultipleChoiceField(
        choices=[],
        required=False,
        widget=forms.SelectMultiple(attrs={'size': '6'})
    )

    remarks_file = forms.FileField(
        required=False,
        help_text="Optional: Upload .xlsx, .docx, .pdf, or .txt for topics extraction"
    )

    class Meta:
        model = training_schedule_temp
        fields = [
            'college_id',
            'no_of_days',
            'location',
            'no_of_batch',
            'no_of_trainer',
            'department_id',
            'year',
            'batches',
            'trainers',
            'topics',
            'no_of_topics',
            'trainer_date',
            'trainer_ids', 
        ]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        instance = kwargs.get("instance", None)
        college = None

        # Get college from instance
        if instance and instance.college_id:
            college = instance.college_id

        # Fallback: try from POST data
        if not college and len(args) >= 1:
            data = args[0]
            college_id = data.get('college_id')
            if college_id:
                try:
                    college = college_master.objects.get(id=college_id)
                except ObjectDoesNotExist:
                    pass

        if college:
            # ✅ Populate batch choices
            batch_qs = candidate_master.objects.filter(
                college_id=college
            ).exclude(batch_no__isnull=True).exclude(batch_no__exact='')\
            .values_list('batch_no', flat=True).distinct()
            self.fields['batches'].choices = [(b, b) for b in batch_qs]

            # ✅ Populate trainer choices
            trainers_list = getattr(college, 'trainers', [])
            self.fields['trainers'].choices = [(t, t) for t in trainers_list]

            # ✅ Set initial if editing
            if instance:
                self.initial['batches'] = instance.batches or []
                self.initial['trainers'] = instance.trainers or []
