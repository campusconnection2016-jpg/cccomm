from rest_framework import serializers
from .models import appinfo, course_schedule,login,training_schedule_temp,job_offers,invoice_form,test_reports,eligible_student_list,comman_announcement,course_trainer_feedback,student_request,course_content_feedback,question_master_temp,company_master, tests_candidates_map,tests_candidates_answers,topic_master,question_master,skill_type,trainer_master,test_master,test_type,question_type,candidate_master,skills_master,content_master,college_master,department_master, rules, question_paper_master, trainers_report
from rest_framework.exceptions import ValidationError
from django.db import IntegrityError
from django.contrib.auth.models import User
from datetime import datetime
from django.utils.timezone import localtime
from django.template.defaultfilters import date as django_format_date
from .models import folder_master
from datetime import timezone
import base64
from datetime import datetime, timedelta

class testtypeSerializers(serializers.ModelSerializer):
    class Meta:
        model = test_type
        fields = ['id', 'test_type', 'test_type_categories']

class questiontypeSerializers(serializers.ModelSerializer):
    class Meta:
        model = question_type
        fields = [ 'id', 'question_type']
class collegeSerializers(serializers.ModelSerializer):
    class Meta:
        model = college_master
        fields = [ 'id', 'college','college_group','college_code']
        extra_kwargs = {
            'college_group': {'allow_null': True},
        }

class departmentSerializers(serializers.ModelSerializer):
    class Meta:
        model = department_master
        fields = [ 'id', 'department']
class topicSerializers(serializers.ModelSerializer):
    class Meta:
        model = topic_master
        fields = [ 'id', 'topic','sub_topic']
class skilltypeSerializer(serializers.ModelSerializer):
    # Show the question_type name on read
    question_type_name = serializers.CharField(source='question_type_id.question_type', read_only=True)

    class Meta:
        model = skill_type
        fields = ['id', 'skill_type', 'question_type_id', 'question_type_name']


class skilltypeSerializertrainer(serializers.ModelSerializer):
    # Show the question_type name on read
  
    class Meta:
        model = skill_type
        fields = ['id', 'skill_type']

class skillSerializer(serializers.ModelSerializer):
    class Meta:
        model = skills_master
        fields = ['id','skill_name']


class candidatesSerializer(serializers.ModelSerializer):
    skill_id = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=skills_master.objects.all(),
        required=False  # Make skill_id optional
    )

    class Meta:
        model = candidate_master
        fields = [
            'id',
            'college_id',
            'students_name',
            'skill_id',
            'registration_number',
            'gender',
            'email_id',
            'mobile_number',
            'department_id',
            'year',
            'cgpa',
            'marks_10th',
            'marks_12th',
            'history_of_arrears',
            'standing_arrears',
            'number_of_offers',
            'it_of_offers',
            'core_of_offers',
            'user_name',
            'batch_no',
            'text',
             # You should accept this even if it’s used only for login creation
        ]
        extra_kwargs = {
            'students_name': {'required': False},
            'skill_id': {'required': False},
            'registration_number': {'required': False},
            'gender': {'required': False},
            'email_id': {'required': False},
            'mobile_number': {'required': False},
            'department_id': {'required': False},
            'year': {'required': False},
            'cgpa': {'required': False},
            'marks_10th': {'required': False},
            'marks_12th': {'required': False},
            'history_of_arrears': {'required': False},
            'standing_arrears': {'required': False},
            'number_of_offers': {'required': False},
            'it_of_offers': {'required': False},
            'core_of_offers': {'required': False},
            'batch_no': {'required': False},
            'text': {'required': False},
              # Not used in model, but might be passed in payload
        }

    def create(self, validated_data):
        # Extract optional offer fields
        it_of_offers = validated_data.pop('it_of_offers', 0) or 0
        core_of_offers = validated_data.pop('core_of_offers', 0) or 0
        validated_data['number_of_offers'] = it_of_offers + core_of_offers
        validated_data['is_database'] = True
        return super().create(validated_data)

    def update(self, instance, validated_data):
        it_of_offers = validated_data.get('it_of_offers', getattr(instance, 'it_of_offers', 0)) or 0
        core_of_offers = validated_data.get('core_of_offers', getattr(instance, 'core_of_offers', 0)) or 0
        validated_data['number_of_offers'] = it_of_offers + core_of_offers
        validated_data['is_database'] = True
        return super().update(instance, validated_data)

class contentSerializers_OLD2007(serializers.ModelSerializer):
    dtm_validity_formatted = serializers.SerializerMethodField()

    class Meta:
        model = content_master
        fields = ['id', 'content_url', 'actual_content', 'status', 'topic', 'sub_topic', 'skill_type_id', 'question_type_id',
                   'dtm_validity', 'dtm_validity_formatted']
      
    def get_dtm_validity_formatted(self, obj):
        return django_format_date(localtime(obj.dtm_validity), 'd-m-Y h:i A')

class contentSerializers(serializers.ModelSerializer):
    dtm_validity_formatted = serializers.SerializerMethodField()

    class Meta:
        model = content_master
        fields = ['id', 'content_url', 'actual_content', 'status', 'topic','sub_topic',  'skill_type_id', 'question_type_id',
                   'dtm_validity', 'dtm_validity_formatted', 'worksheet_link',]
       
    def get_dtm_validity_formatted(self, obj):
        return django_format_date(localtime(obj.dtm_validity), 'd-m-Y h:i A')
    def create(self, validated_data):
        topic_name = validated_data.get('topic')
        sub_topic_name = validated_data.get('sub_topic')

        # Create or get the topic_master entry
        topic_master_obj, created = topic_master.objects.get_or_create(
            topic=topic_name,
            sub_topic=sub_topic_name
        )

        # Assign the topic_master object to the question paper
        validated_data['topic'] = topic_master_obj.topic
        validated_data['sub_topic'] = topic_master_obj.sub_topic
        validated_data['dtm_created'] = datetime.now()
        return super().create(validated_data)



class testsSerializers(serializers.ModelSerializer):
    test_type_id = testtypeSerializers()
    class Meta:
        model = test_master
        fields = ['id','test_name', 'test_type_id','question_type_id','skill_type_id',
         ]

class testsSerializersAddUpdate(serializers.ModelSerializer):
    class Meta:
        model = test_master
        fields =['id','test_name', ]


class testsSerializersAdd(serializers.ModelSerializer):
    class Meta:
        model = test_master
        fields =['id','test_name', 'test_type_id','question_type_id','skill_type_id','company_name','company_email','is_company','round_of_interview' ]



class testcandidatemapSerializersupdate(serializers.ModelSerializer):
    class Meta:
        model = tests_candidates_map
        fields = [
            "id", "test_name", "question_id", "student_id", "college_id",
            "dtm_start", "dtm_login", "dtm_submit", "dtm_start_test", "status",
            "dtm_end", "dtm_start1", "dtm_end1", "attempt_count", "is_camera_on",
            "department_id", "duration", "year", "rules_id", "is_active",
            "need_candidate_info", "total_score", "avg_mark",
            "duration_type", "dtm_created", "created_by"
        ]

    def to_internal_value(self, data):
        data = data.copy()

        # Flexible parsing for dtm_start
        dtm_start = data.get("dtm_start")
        if dtm_start and isinstance(dtm_start, str):
            try:
                # Support both "13-09-2025 11:28 AM" and "2025-09-13T11:28:00"
                try:
                    data["dtm_start"] = datetime.strptime(dtm_start, "%d-%m-%Y %I:%M %p")
                except ValueError:
                    data["dtm_start"] = datetime.fromisoformat(dtm_start)
            except Exception as e:
                raise serializers.ValidationError({"dtm_start": f"Invalid date format: {e}"})

        # Flexible parsing for dtm_end
        dtm_end = data.get("dtm_end")
        if dtm_end and isinstance(dtm_end, str):
            try:
                try:
                    data["dtm_end"] = datetime.strptime(dtm_end, "%d-%m-%Y %I:%M %p")
                except ValueError:
                    data["dtm_end"] = datetime.fromisoformat(dtm_end)
            except Exception as e:
                raise serializers.ValidationError({"dtm_end": f"Invalid date format: {e}"})

        return super().to_internal_value(data)

    def update(self, instance, validated_data):
        dtm_start = validated_data.get("dtm_start", instance.dtm_start)
        dtm_end = validated_data.get("dtm_end", instance.dtm_end)
        duration_type = validated_data.get("duration_type", instance.duration_type)
        question_id = validated_data.get("question_id", instance.question_id)
        duration = validated_data.get("duration", instance.duration)

        # CASE 1: Start&EndTime → calculate duration
        if duration_type == "Start&EndTime" and dtm_start and dtm_end:
            validated_data["duration"] = int((dtm_end - dtm_start).total_seconds() / 60)

        # CASE 2: QuestionTime → calculate dtm_end
        elif duration_type == "QuestionTime":
            if question_id and duration and int(duration) > 0 and dtm_start:
                dtm_end = dtm_start + timedelta(minutes=int(duration))

        # ✅ Make sure validated_data contains correct dtm_start and dtm_end
        validated_data["dtm_start"] = dtm_start
        validated_data["dtm_end"] = dtm_end

        return super().update(instance, validated_data)


class testcandidatemapSerializersupdateNew(serializers.ModelSerializer):
    class Meta:
        model = tests_candidates_map
        fields = [
            "id",
            "test_name",
            "question_id",
            "dtm_start",
            "dtm_end",
            "dtm_start1",
            "dtm_end1",
            "duration",
            "rules_id",
            "is_active",
            "need_candidate_info",
            "duration_type",
            'dtm_created'
        ]

    def to_internal_value(self, data):
        data = data.copy()

        # Parse dtm_start
        dtm_start = data.get("dtm_start") or data.get("dtm_start1")
        if dtm_start and isinstance(dtm_start, str):
            try:
                try:
                    data["dtm_start"] = datetime.strptime(dtm_start, "%d-%m-%Y %I:%M %p")
                except ValueError:
                    data["dtm_start"] = datetime.fromisoformat(dtm_start)
            except Exception as e:
                raise serializers.ValidationError({"dtm_start": f"Invalid date format: {e}"})

        # Parse dtm_end
        dtm_end = data.get("dtm_end") or data.get("dtm_end1")
        if dtm_end and isinstance(dtm_end, str):
            try:
                try:
                    data["dtm_end"] = datetime.strptime(dtm_end, "%d-%m-%Y %I:%M %p")
                except ValueError:
                    data["dtm_end"] = datetime.fromisoformat(dtm_end)
            except Exception as e:
                raise serializers.ValidationError({"dtm_end": f"Invalid date format: {e}"})

        return super().to_internal_value(data)

    def update(self, instance, validated_data):
        # Give priority to dtm_start1 / dtm_end1 if provided
        if "dtm_start1" in validated_data:
            validated_data["dtm_start"] = validated_data["dtm_start1"]
        if "dtm_end1" in validated_data:
            validated_data["dtm_end"] = validated_data["dtm_end1"]

        dtm_start = validated_data.get("dtm_start", instance.dtm_start)
        dtm_end = validated_data.get("dtm_end", instance.dtm_end)
        duration_type = validated_data.get("duration_type", instance.duration_type)
        question_id = validated_data.get("question_id", instance.question_id)
        duration = validated_data.get("duration", instance.duration)

        # CASE 1: Start&EndTime → calculate duration
        if duration_type == "Start&EndTime" and dtm_start and dtm_end:
            validated_data["duration"] = int((dtm_end - dtm_start).total_seconds() / 60)

        # CASE 2: QuestionTime → calculate dtm_end
        elif duration_type == "QuestionTime":
            if question_id and duration and int(duration) > 0 and dtm_start:
                dtm_end = dtm_start + timedelta(minutes=int(duration))

        # Always overwrite
        validated_data["dtm_start"] = dtm_start
        validated_data["dtm_end"] = dtm_end

        return super().update(instance, validated_data)

class questionsSerializer(serializers.ModelSerializer):
    class Meta:
        model = question_master
        fields = [ 'id','question_name' ,'question_text','view_hint', 'option_a', 'option_b', 'option_c', 'option_d','option_e', 'answer', 'negative_mark','mark','explain_answer', 'input_format','sections']


class questionsSerializerMasterData(serializers.ModelSerializer):
    class Meta:
        model = question_master
        fields = [ 'id','question_name' ,'question_text','view_hint', 'option_a', 'option_b', 'option_c', 'option_d', 'option_e', 'option_f', 'question_type_id', 'skill_id','answer', 'negative_mark','mark','explain_answer', 'input_format','sections']


#class testcandidatemapSerializers(serializers.ModelSerializer):
#    class Meta:
#        model = tests_candidates_map
#        fields = ['id','test_name','question_id','student_id','college_id', 'dtm_start',
#        'dtm_end','dtm_login','dtm_submit','dtm_start_test','status','dtm_start1','dtm_end1',
#        'attempt_count','is_camera_on','department_id','duration','year','rules_id','is_active','created_by','need_candidate_info', 'total_score', 'avg_mark', 'duration_type', 'dtm_created']

class NonDbTestAssignSerializer(serializers.ModelSerializer):
    class Meta:
        model = tests_candidates_map
        fields = ['id','test_name','question_id','student_id', 'college_id', 'dtm_start','dtm_login','dtm_submit','dtm_start_test','status',
        'dtm_end','dtm_start1','dtm_end1',
        'attempt_count','is_camera_on', 'duration','rules_id','is_active','need_candidate_info', 'total_score', 'avg_mark', 'duration_type', 'dtm_created','created_by']



class tests_candidates_answerSerializer(serializers.ModelSerializer):
    class Meta:
        model = tests_candidates_answers
        fields = ['id','student_id','question_id','answer','test_name','result', 'dtm_start', 'dtm_end', 'submission_compile_code', 'compile_code_editor']

class loginSerializer(serializers.ModelSerializer):
    class Meta:
        model = login
        fields = '__all__'

class loginSerializerUpdatefunction(serializers.ModelSerializer):
    class Meta:
        model = login
        fields = ['id','user_name','password','college_id','role','email_id']
    
 



class commanannouncementSerializer(serializers.ModelSerializer):
    class Meta:
        model = comman_announcement
        fields = ['id',
            'candidate_id',
            'login_id','trainer_id','announcement_image',
                 
                  'dtm_start',
                 
'created_by','modified_by'
           
                  
                  ]



#-------------------Import Serializers---------------------------------------#



class MultiTypeField(serializers.Field):
    def to_internal_value(self, data):
        if isinstance(data, (int, float, bool, str)):
            return data
        if isinstance(data, str):
            # Check if the string is a percentage (contains '%')
            if "%" in data:
                return data  # Return the percentage string as is
        try:
            # Attempt to convert to a string (useful if it's a float-like string)
            return str(data)
        except (ValueError, TypeError):
            raise serializers.ValidationError('Not a valid input.')

    def to_representation(self, value):
        # Return the value as is, whether it's a string, integer, float, etc.
        return value


class questionsSerializerImport(serializers.ModelSerializer):
    question_name_id = serializers.PrimaryKeyRelatedField(queryset=question_paper_master.objects.all(), write_only=True)
    question_text = MultiTypeField(allow_null=True, required=False)
    option_a = MultiTypeField(allow_null=True, required=False)
    option_b = MultiTypeField(allow_null=True, required=False)
    option_c = MultiTypeField(allow_null=True, required=False)
    option_d = MultiTypeField(allow_null=True, required=False)
    option_e = MultiTypeField(allow_null=True, required=False)
    answer = serializers.CharField(allow_blank=True, allow_null=True, max_length=1000, required=False, style={'base_template': 'textarea.html'})
    explain_answer = serializers.CharField(allow_blank=True, allow_null=True, max_length=1000, required=False, style={'base_template': 'textarea.html'})
    mark = serializers.IntegerField(allow_null=True, max_value=2147483647, min_value=-2147483648, required=False)
    sections = serializers.CharField(allow_blank=True, required=False) 
     
    difficulty_level = serializers.CharField(allow_blank=True, allow_null=True, required=False)
    class Meta:
        model = question_master
        fields = '__all__'

    def create(self, validated_data):
        question_name_id = validated_data.pop('question_name_id')
        return question_master.objects.create(question_name_id=question_name_id, **validated_data)


class questionsSerializerImportPhysico(serializers.ModelSerializer):
    MARK_METHOD_CHOICES = [
        ('A-E', 'A-E'),
        ('E-A', 'E-A'),
    ]

    question_name_id = serializers.PrimaryKeyRelatedField(queryset=question_paper_master.objects.all(), write_only=True)
    question_text = MultiTypeField(allow_null=True, required=False)
    option_a = MultiTypeField(allow_null=True, required=False)
    option_b = MultiTypeField(allow_null=True, required=False)
    option_c = MultiTypeField(allow_null=True, required=False)
    option_d = MultiTypeField(allow_null=True, required=False)
    option_e = MultiTypeField(allow_null=True, required=False)
    sections = serializers.CharField(allow_blank=True, required=False) 
    
    # ✅ Override ChoiceField to allow lowercase inputs
    class CaseInsensitiveChoiceField(serializers.ChoiceField):
        def to_internal_value(self, data):
            if isinstance(data, str):
                data = data.strip().upper()  # Convert to uppercase
            return super().to_internal_value(data)

    mark_method = CaseInsensitiveChoiceField(choices=MARK_METHOD_CHOICES, required=True)

    class Meta:
        model = question_master
        fields = '__all__'

    def create(self, validated_data):
        question_name_id = validated_data.pop('question_name_id')
        return question_master.objects.create(question_name_id=question_name_id, **validated_data)


class candidateSerializerImport(serializers.ModelSerializer):
   
    cgpa = serializers.FloatField(default=0.0, allow_null=True, required=False)
    marks_10th = serializers.FloatField(default=0.0, allow_null=True, required=False)
    marks_12th = serializers.FloatField(default=0.0, allow_null=True, required=False)
    history_of_arrears = serializers.IntegerField(default=0, allow_null=True, required=False)
    standing_arrears = serializers.IntegerField(default=0, allow_null=True, required=False)
    it_of_offers = serializers.IntegerField(default=0, allow_null=True, required=False)
    core_of_offers = serializers.IntegerField(default=0, allow_null=True, required=False)
    number_of_offers = serializers.IntegerField(default=0, allow_null=True, required=False)

    class Meta:
        model = candidate_master
        fields = ['college_id', 'students_name', 'registration_number', 'gender', 'email_id', 'mobile_number',
                  'department_id', 'year', 'cgpa', 'marks_10th', 'marks_12th', 'marks_semester_wise','batch_no',
                  'history_of_arrears', 'standing_arrears', 'number_of_offers', 'user_name', 'text', 'it_of_offers','core_of_offers', 'is_database']
    def create(self, validated_data):
        return candidate_master.objects.create(**validated_data)


class testsSerializersImport(serializers.ModelSerializer):
    class Meta:
        model = test_master
        fields = ['test_name', 'test_type_id','question_type_id', 'skill_type_id']

    def create(self, validated_data):
        return test_master.objects.create(**validated_data)

class ruleSerializers(serializers.ModelSerializer):
    class Meta:
        model =rules 
        fields = ['id', 'rule_name','instruction']

class loginSerializerStu(serializers.ModelSerializer):
    role = serializers.CharField(default='Student')

    class Meta:
        model = login
        fields = '__all__'



class questionsSerializerCodeImport(serializers.ModelSerializer):
    question_name_id = serializers.PrimaryKeyRelatedField(queryset=question_paper_master.objects.all(), write_only=True)

    class Meta:
        model = question_master
        fields = ['question_name_id', 'question_text', 'answer', 'mark', 'explain_answer', 'input_format','test_case1','test_case2','test_case3','difficulty_level']

    def create(self, validated_data):
        question_name_id = validated_data.pop('question_name_id')
        return question_master.objects.create(question_name_id=question_name_id, **validated_data)


class candidatesoneSerializer(serializers.ModelSerializer):
   
    class Meta:
        model = candidate_master
        fields = ['id','text']

class questionsPaperSerializer(serializers.ModelSerializer):
    class Meta:
        model = question_paper_master
        fields = [ 'id','question_paper_name','no_of_questions','upload_type','test_type','topic', 'sub_topic','dtm_created', 'folder_name','is_testcase', 'duration_of_test', 'created_by', 'modified_by','remarks','audio_text']

    def create(self, validated_data):
        topic_name = validated_data.get('topic')
        sub_topic_name = validated_data.get('sub_topic')

        # Create or get the topic_master entry
        topic_master_obj, created = topic_master.objects.get_or_create(
            topic=topic_name,
            sub_topic=sub_topic_name
        )

        # Assign the topic_master object to the question paper
        validated_data['topic'] = topic_master_obj.topic
        validated_data['sub_topic'] = topic_master_obj.sub_topic
        validated_data['dtm_created'] = datetime.now()
        return super().create(validated_data)

class questionsSerializer_IO(serializers.ModelSerializer):
    class Meta:
        model = question_master
        fields = [ 'id',
                  'question_name_id' ,
                  'question_text',
                  'question_image_data',
                  'option_a_image_data',
                  'option_b_image_data',
                  'option_c_image_data',
                  'option_d_image_data',
                  'option_a', 
                  'option_b', 
                  'option_c', 
                  'option_d',
                   
                   'option_e',
                   
                  'answer', 
                  'negative_mark',
                  'mark',
                  'explain_answer', 
                  'input_format',
                  'sections']



class candidateuserSerializerImport_OLD0406(serializers.ModelSerializer):
    class Meta:
        model = candidate_master
        fields = [ 'user_name','is_database']
    def create(self, validated_data):
        return candidate_master.objects.create(**validated_data)


class candidateuserSerializerImport(serializers.ModelSerializer):
    class Meta:
        model = candidate_master
        fields = [ 'user_name','is_database', 'college_id', 'dtm_upload','batch_no']

class loginSerializerStuser_OLD0406(serializers.ModelSerializer):
    role = serializers.CharField(default='Student')

    class Meta:
        model = login
        fields =  [ 'user_name','role','password']       


class loginSerializerStuser(serializers.ModelSerializer):
    role = serializers.CharField(default='Student')

    class Meta:
        model = login
        fields =  [ 'user_name','role','password', 'college_id']


class questionsSerializer_code(serializers.ModelSerializer):
    class Meta:
        model = question_master
        fields = [ 'id',
                  'question_name_id' ,
                  'question_text',
                  'question_image_data',
                  
                  'answer', 
                  'negative_mark',
                  'mark',
                  'explain_answer', 
                  'input_format',
                  'test_case1',
                  'test_case2',
                  'test_case3',
                  'difficulty_level'
                  ]



class jobSerializer(serializers.ModelSerializer):
    department_id = serializers.PrimaryKeyRelatedField(
        many=True,  # This indicates that you expect multiple department IDs
        queryset=department_master.objects.all(),
        required=False
    )

    class Meta:
        model = job_offers
        fields = [
            'id', 'company_name', 'company_profile', 'interview_date', 'year',
            'post_name', 'intern_fulltime', 'on_off_campus', 'skill_id',
            'department_id', 'college_id', 'cgpa', 'marks_10th', 'marks_12th',
            'job_type', 'history_of_arrears', 'standing_arrears', 'gender',
            'location', 'no_of_offers','packages'
        ]

    def validate_department_id(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("Expected a list of department IDs.")
        return value


class jobOfferSerializer(serializers.ModelSerializer):
    department_id = serializers.PrimaryKeyRelatedField(
        many=True,  # This indicates that you expect multiple department IDs
        queryset=department_master.objects.all(),
        required=False
    )

    class Meta:
        model = job_offers
        fields = [
            'id', 'company_name', 'company_profile', 'interview_date', 'year',
            'post_name', 'intern_fulltime', 'on_off_campus', 'skill_id',
            'department_id', 'college_id', 'cgpa', 'marks_10th', 'marks_12th',
            'job_type', 'history_of_arrears', 'standing_arrears', 'gender',
            'location', 'no_of_offers','packages'
        ]

    def validate_department_id(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("Expected a list of department IDs.")
        return value


class jobOffersSerializer(serializers.ModelSerializer):
    department_id = serializers.PrimaryKeyRelatedField(
        many=True,  # This indicates that you expect multiple department IDs
        queryset=department_master.objects.all(),
        required=False
    )

    class Meta:
        model = job_offers
        fields = [
            'id', 'company_name', 'company_profile', 'interview_date', 'year',
            'post_name', 'intern_fulltime', 'on_off_campus', 'skill_id',
            'department_id',  'cgpa', 'marks_10th', 'marks_12th',
            'job_type', 'history_of_arrears', 'standing_arrears', 'gender',
            'location', 'no_of_offers','packages'
        ]

    def validate_department_id(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("Expected a list of department IDs.")
        return value



class eligible_studentSerializer(serializers.ModelSerializer):
   
    class Meta:
        model = eligible_student_list
        fields = ['id','students_id','announcement','job_id','round_of_interview','is_accept','is_eligible']

class eligible_studentSerializerupdate(serializers.ModelSerializer):
   
    class Meta:
        model = eligible_student_list
        fields = ['id','students_id','is_eligible']

class companySerializer(serializers.ModelSerializer):
   
    class Meta:
        model = company_master
        fields = ['id','company_name', 'company_profile', ]

class QuestionMasterTempSerializer(serializers.ModelSerializer):
    class Meta:
        model = question_master_temp
        fields = '__all__'

 
class courseScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = course_schedule
        fields = ['id',
            'college_id',
                  'department_id',
                  'trainer_ids',
                  'topic_id',
                  'student_id',
                  'year',
                  'dtm_start_student',
                  'dtm_end_student',
                  'dtm_start_trainer',
                  'dtm_end_trainer',
                  'dtm_of_training',
                 
                  'dtm_created',
                  'feedback',
                  'remarks',
                 
                ]

class courseStudentfeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = course_schedule
        fields = ['id',
                  'feedback',
                  'remarks'
                ]
 
class courseContentFeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = course_content_feedback
        fields = ['id',
                  'student_id',
                  'topic_id',
                  'dtm_session',
                  'trainer_id',
                  'feedback',
                  'remarks',
                  'training_id']


class trainerSerializer(serializers.ModelSerializer):
    resume_url = serializers.SerializerMethodField()

    class Meta:
        model = trainer_master
        fields = ['id', 'trainer_name', 'location', 'certification', 'pan_number', 'gst',
                  'experience', 'qualification', 'is_active', 'state', 'city', 'mobile_no',
                  'email_id', 'skill_id', 'languages_known', 'bank_name', 'ifsc_code', 
                  'branch_name', 'account_no', 'user_name', 'photo', 'resume_url', 
                  'is_edit', 'is_terms', 'address','remarks']

    def get_resume_url(self, obj):
        # Return only the relative path of the resume
        return obj.resume.url if obj.resume else None
 



class trainerfeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = course_trainer_feedback
        fields = ['college_id',
                  'department_id',
                  'trainer_id',
                  'topic_id',
                 # 'year',
                  'dtm_complete',
                  
                  'completion_status',
                  'feedback']


class studentRequestSerializer(serializers.ModelSerializer):
    # Define a method field to display the user_name of the related student_id
    user_name = serializers.SerializerMethodField()

    class Meta: 
        model = student_request
        fields = ['id',
                  'student_id',
                  'user_name', 
                  'dtm_request',
                  'student_query',
                  'approved_by',
                  'dtm_approved',
                  'dtm_student_update',
                  'status',
                  'is_query_type','remarks'
                  ]

    def get_user_name(self, obj):
        # Retrieve the user_name from the related candidate_master model
        return obj.student_id.user_name if obj.student_id else None


#------------------Django Login-----------------------#


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    email = serializers.EmailField(allow_blank=True, required=False, allow_null=True) 

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'email']
        extra_kwargs = {'password': {'write_only': True} }
    

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        
        if request and request.method == 'GET':
            # Include password in GET request response
            data['password'] = instance.password
        
        return data
class TestCandidateMapSerializerNeedInfo(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student_id.students_name')
    user_name = serializers.CharField(source='student_id.user_name')

    class Meta:
        model = tests_candidates_map
        fields = ['test_name', 'student_id', 'student_name', 'user_name', 'need_candidate_info']

class TestCandidateMapSerializerLey(serializers.ModelSerializer):
  
    class Meta:
        model = tests_candidates_map
        fields = ['id', 'capture_passkey']

class trainer_ReportSerializers(serializers.ModelSerializer):
    class Meta:
        model =trainers_report
        fields = ['id', 'course_schedule_id',
                  'no_of_question_solved',
                  'comments','activities_done',
                  'status',
                  'student_feedback',
                  'infrastructure_feedback',
                  'remarks'
                  ]

class trainer_ReportSerializerstrain(serializers.ModelSerializer):
    class Meta:
        model = trainers_report
        fields = [
            'id',
            'training_schedule_id',
            'no_of_question_solved',
            'comments',
            'activities_done',
            'status',
            'student_feedback',
            'infrastructure_feedback',
            'remarks',
           
        ]

class trainerSerializerSkills(serializers.ModelSerializer):
    resume_url = serializers.SerializerMethodField()
    skill_id = skillSerializer(many=True)  
    class Meta:
        model = trainer_master
        fields = ['id',
            'trainer_name', 'location', 'certification', 'pan_number', 'gst',
           'experience','qualification', 'is_active',
            'state', 'city', 'mobile_no', 'email_id', 'skill_id',
            'languages_known', 'bank_name', 'ifsc_code', 'branch_name',
            'account_no',  'user_name','photo','resume_url' ,'is_edit','is_terms', 'deleted'    ]

    def get_resume_url(self, obj):
        # Return the full URL if the resume exists, else None
        request = self.context.get('request')
        if obj.resume:
            return request.build_absolute_uri(obj.resume.url)
        return None

class loginSerializerupdatepass(serializers.ModelSerializer):
    class Meta:
        model = login
        fields = ['id','user_name','password','mobile_number','email_id']
    
class testReportsSerializer(serializers.ModelSerializer):
    college_name = serializers.CharField(source='college_id.college', read_only=True)
    department_name = serializers.CharField(source='department_id.department', read_only=True)

    class Meta:
        model = test_reports
        fields = ['test_name', 'year', 'college_name', 'department_name', 'students_count']

class QuestionPaperSerializers(serializers.ModelSerializer):
    class Meta:
        model = question_paper_master
        fields = ['id','question_paper_name',
                  'duration_of_test','topic','sub_topic', 'folder_name','is_testcase','remarks','audio_text']
class questionsPaperSerializer_Place(serializers.ModelSerializer):
    class Meta:
        model = question_paper_master
        fields = [ 'id',
                  'question_paper_name',
                  'no_of_questions',
                  'duration_of_test',
                  'upload_type',
                  'test_type',
                  'topic', 
                  'sub_topic',
                  'dtm_created',
                  'created_by',
                  'folder_name','is_testcase'
                  ,'remarks'   # ✅ added
                  ]

    def create(self, validated_data):
        topic_name = validated_data.get('topic')
        sub_topic_name = validated_data.get('sub_topic')
        created_by_value = validated_data.get('created_by')

        # Create or get the topic_master entry
        topic_master_obj, created = topic_master.objects.get_or_create(
            topic=topic_name,
            sub_topic=sub_topic_name
        )

        # Assign the topic_master object to the question paper
        validated_data['topic'] = topic_master_obj.topic
        validated_data['sub_topic'] = topic_master_obj.sub_topic
        validated_data['dtm_created'] = datetime.now()
        validated_data['created_by'] = created_by_value
        return super().create(validated_data)
    
class testReportsSerializer_testname(serializers.ModelSerializer):
    class Meta:
        model = test_reports
        fields =['id','test_name', ]

class invoice_formserializer(serializers.ModelSerializer):
    class Meta:
        model = invoice_form
        fields =['id','college_id','payment_status','trainer_id',
                 'misc_expenses','travel_expenses',
                  'food_allowance', 'misc_expenses_text','travel_expenses_text',
                  'food_allowance_text','misc_expenses_type', 
                  'overall_feedback','dtm_start','dtm_end',
                  'travel_amount','print_amount','food_amount',
                  'travel_days','print_days','food_days','training_amount','training_days','invoice_no','schedule_date']

class InvoiceDateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = invoice_form
        fields = ['id','schedule_date']  # Include only the schedule_date field

    
#__________________________selvi new____________________________________#


class testsupdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = test_master
        fields =['is_company' ]

class TestMasterEmailUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = test_master
        fields = ['company_email','round_of_interview','company_name']

class TestroundUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = test_master
        fields = ['student_ids','round_of_interview','company_name']



class invoice_formupdateserializer(serializers.ModelSerializer):
    class Meta:
        model = invoice_form
        fields =['id','college_id','trainer_id',
                 'misc_expenses','travel_expenses',
                  'food_allowance', 'misc_expenses_type', 
                  'overall_feedback','is_tds_deduct',
                  'travel_amount','print_amount','food_amount',
                  'travel_days','food_days','training_amount','training_days','invoice_no']
   

class contentSerializers_NEW(serializers.ModelSerializer):

    class Meta:
        model = content_master
        fields = ['id', 
                  'content_url', 
                  'actual_content',
                  'worksheet_link',
                  'topic',
                  'skill_type_id', 
                  'question_type_id',
                ]
        
class StudentRequestSerializer(serializers.ModelSerializer):
    student_id = serializers.IntegerField(source='student_id.id', read_only=True)  # Include student_id
    student_name = serializers.CharField(source='student_id.students_name', read_only=True)

    class Meta:
        model = student_request
        fields = ['id', 'student_id', 'student_name', 'student_query', 'status', 'is_query_type', 'dtm_request']

class TrainingScheduleUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = training_schedule_temp
        fields = ['trainer_date']


class TrainerCreateSerializer(serializers.Serializer):
    trainer_name = serializers.CharField()
    user_name = serializers.CharField()
    skill_type = serializers.ListField(child=serializers.IntegerField(), write_only=True)
    password = serializers.CharField(write_only=True)
    role = serializers.CharField(default='Trainer')

    def create(self, validated_data):
        skill_ids = validated_data.pop('skill_type')
        role = validated_data.get('role', 'Trainer')

        # Create login record
        login_obj = login.objects.create(
            user_name=validated_data['user_name'],
            password=validated_data['password'],
            role=role
        )

        # Create trainer_master record
        trainer = trainer_master.objects.create(
            trainer_name=validated_data['trainer_name'],
            user_name=validated_data['user_name']
        )
        trainer.skill_id.set(skill_ids)

        return trainer

class CollegeSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = college_master
        fields = ['college', 'college_code']


class QuestionCountSerializer(serializers.Serializer):
    question_name_id = serializers.IntegerField()
    no_of_questions = serializers.IntegerField()

class testcandidatemapSerializers(serializers.ModelSerializer):
    class Meta:
        model = tests_candidates_map
        fields = [
            'id',
            'test_name',
            'question_id',
            'question_ids',      # JSONField for list of question_master IDs
            # 'duration_of_test',
            'duration',
            'no_of_question',
            'student_id',
            'college_id',
            'dtm_start',
            'dtm_end',
            'dtm_login',
            'dtm_submit',
            'dtm_start_test',
            'status',
            'dtm_start1',
            'dtm_end1',
            'attempt_count',
            'is_camera_on',
            'department_id',
            'duration_type',
            'year',
            'rules_id',
            'is_active',
            'created_by',
            'need_candidate_info',
            'total_score',
            'avg_mark',
            'dtm_created'
        ]

class TrainerCreateSerializerNew(serializers.Serializer):
    user_name = serializers.CharField()
    batch_no = serializers.CharField(required=True)

    def create(self, validated_data):
        user_name = validated_data.get('user_name')
        batch_no = validated_data.get('batch_no')

        trainer_obj = trainer_master.objects.filter(user_name=user_name).first()

        if not trainer_obj:
            raise serializers.ValidationError("Trainer with this user_name does not exist.")

        # ✅ Update only batch_no
        trainer_obj.batch_no = batch_no
        trainer_obj.save()

        return trainer_obj


from .models import employee_db

class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = employee_db
        fields = [
            'name',
            'emp_id',
            'designation',
            'location',
            'mobile_no',
            'email_id',
            'user_name',
            'deleted',
            'created_by',
            'dtm_created',
        ]
        extra_kwargs = {
            'name': {'required': False, 'allow_blank': True},
            'designation': {'required': False, 'allow_blank': True},
            'location': {'required': False, 'allow_blank': True},
            'mobile_no': {'required': False, 'allow_blank': True},
            'email_id': {'required': False, 'allow_blank': True},
            'user_name': {'required': True},
            'emp_id': {'required': True},
        }


from .models import tests_emp_answer

class tests_emp_answerSerializer(serializers.ModelSerializer):
    emp_id = serializers.CharField(source='emp_id.emp_id', read_only=True)
    question_id = serializers.IntegerField(source='question_id.id', read_only=True)

    class Meta:
        model = tests_emp_answer
        fields = ['id', 'emp_id', 'test_name', 'question_id', 'answer', 'result']


class EmployeeCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = employee_db
        fields = [
            'name', 'emp_id', 'designation', 'location', 'mobile_no', 'email_id',
            'created_by', 'dtm_created', 'password'
        ]

    def create(self, validated_data):
        password = validated_data.pop('password')
        emp_id = validated_data['emp_id']
        email_id = validated_data.get('email_id', None)

        # Create employee record
        employee = employee_db.objects.create(
            user_name=emp_id,
            **validated_data
        )

        # Create login record
        login.objects.create(
            user_name=emp_id,
            password=password,  # 🔐 Consider hashing if used for auth
            email_id=email_id,
            role='Employee'
        )

        return employee

class EmployeedisplaySerializer(serializers.ModelSerializer):
    password = serializers.SerializerMethodField()

    class Meta:
        model = employee_db
        fields = ['id', 'name', 'emp_id', 'location', 'mobile_no', 'email_id', 'designation', 'user_name', 'password']

    def get_password(self, obj):
        try:
            login_obj = login.objects.get(user_name=obj.user_name)
            return login_obj.password
        except login.DoesNotExist:
            return None
class QuestionTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = question_type
        fields = ['id', 'question_type']

class SkillTypeSerializer_filter(serializers.ModelSerializer):
    class Meta:
        model = skill_type
        fields = ['id', 'skill_type', 'question_type_id']

class FolderMasterCreateSerializer(serializers.ModelSerializer):
    # Accept topic id and sub_topic id from frontend
    topic = serializers.PrimaryKeyRelatedField(
        queryset=question_type.objects.filter(deleted=0), write_only=True
    )
    sub_topic = serializers.PrimaryKeyRelatedField(
        queryset=skill_type.objects.filter(deleted=0), write_only=True
    )
    folder_name = serializers.CharField(max_length=1000)
    created_by = serializers.CharField(max_length=100)

    class Meta:
        model = folder_master
        fields = ['topic', 'sub_topic', 'folder_name', 'created_by']

    def validate(self, attrs):
        topic = attrs.get('topic')
        sub_topic = attrs.get('sub_topic')

        # Validate that sub_topic belongs to topic
        if sub_topic.question_type_id != topic:
            raise serializers.ValidationError("Sub topic does not belong to the selected topic.")
        return attrs

    def create(self, validated_data):
        # Extract sub_topic as skill_type object
        skill_type_obj = validated_data.pop('sub_topic')
        # Create folder_master with skill_type_id = sub_topic.id
        folder = folder_master.objects.create(
            skill_type_id=skill_type_obj,
            folder_name=validated_data.get('folder_name'),
            created_by=validated_data.get('created_by'),
            dtm_created=timezone.now()
        )
        return folder


class FolderMasterUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = folder_master
        fields = ['skill_type_id', 'folder_name']



class CandidateMasterSerializer(serializers.ModelSerializer):
    class Meta:
        model = candidate_master
        fields = '__all__'



class FolderMasterSerializer(serializers.ModelSerializer):
    topic = serializers.CharField(source='skill_type_id.question_type_id.question_type', read_only=True)
    sub_topic = serializers.CharField(source='skill_type_id.skill_type', read_only=True)
    skill_type_id = serializers.PrimaryKeyRelatedField(read_only=True)
    question_type_id = serializers.IntegerField(source='skill_type_id.question_type_id.id', read_only=True)  # 👈 Add this
    folder_logo = serializers.SerializerMethodField()

    class Meta:
        model = folder_master
        fields = ['id','question_type_id', 'skill_type_id','folder_name', 'created_by', 'dtm_created', 'deleted',  'topic', 'sub_topic','folder_logo']

    def get_folder_logo(self, obj):
        if obj.folder_logo:
            return base64.b64encode(obj.folder_logo).decode('utf-8')
        return None    
class CandidateMasterSerializer(serializers.ModelSerializer):
    class Meta:
        model = candidate_master
        fields = ['id', 'user_name', 'college_id', 'department_id', 'year']
class TrainingScheduleTempSerializer(serializers.ModelSerializer):
    class Meta:
        model = training_schedule_temp
        fields = [
            "id",
            "question_type",
            "skill_type",
            "batch_skill"
        ]

class folderSerializer(serializers.ModelSerializer):
    folder_logo = serializers.SerializerMethodField(read_only=True)
    folder_logo_upload = serializers.CharField(write_only=True, required=False, allow_null=True)
    syllabus = serializers.CharField(required=False, allow_null=True, allow_blank=True)

    class Meta:
        model = folder_master
        fields = ['id', 'folder_name', 'skill_type_id', 'folder_logo', 'folder_logo_upload', 'syllabus']

    def get_folder_logo(self, obj):
        if obj.folder_logo:
            return base64.b64encode(obj.folder_logo).decode('utf-8')
        return None

    def validate(self, data):
        print(">>> VALIDATE incoming data:", data)   # 🔍 Debug print

        folder_name = data.get('folder_name') or (self.instance.folder_name if self.instance else None)
        skill_type_id = data.get('skill_type_id') or (self.instance.skill_type_id if self.instance else None)

        if folder_name:
            folder_name = folder_name.strip()

        qs = folder_master.objects.filter(
            folder_name__iexact=folder_name,
            skill_type_id=skill_type_id,
        )
        if hasattr(folder_master, "deleted"):
            qs = qs.filter(deleted=0)

        if self.instance:
            qs = qs.exclude(id=self.instance.id)

        if qs.exists():
            print(">>> VALIDATION FAILED: duplicate found")
            raise serializers.ValidationError(
                "This folder name already exists for the selected skill type."
            )

        print(">>> VALIDATION PASSED")
        return data

    def create(self, validated_data):
        print(">>> CREATE validated data before processing:", validated_data)  # 🔍 Debug print
        folder_logo_b64 = validated_data.pop('folder_logo_upload', None)
        if folder_logo_b64:
            try:
                validated_data['folder_logo'] = base64.b64decode(folder_logo_b64)
                print(">>> Logo decoded successfully")
            except Exception as e:
                print(">>> ERROR decoding logo:", e)
                raise serializers.ValidationError("Invalid base64 for folder_logo_upload")
        instance = super().create(validated_data)
        print(">>> CREATE completed. Instance:", instance.id)
        return instance


class folderNewSerializer(serializers.ModelSerializer):
    # Show the question_type name on read
    skill_type_name = serializers.CharField(source='skill_type_id.skill_type', read_only=True)
    

    class Meta:
        model = folder_master
        fields = ['id', 'folder_name', 'skill_type_id', 'skill_type_name','folder_logo','syllabus']


    def create(self, validated_data):
        folder_logo_b64 = validated_data.pop('folder_logo', None)
        if folder_logo_b64:
            validated_data['folder_logo'] = base64.b64decode(folder_logo_b64)
        else:
            validated_data['folder_logo'] = None
        return super().create(validated_data)

    def update(self, instance, validated_data):
        folder_logo_b64 = validated_data.pop('folder_logo', None)

        if folder_logo_b64 is not None:
            if folder_logo_b64 == '' or folder_logo_b64 is None:
                instance.folder_logo = None
            else:
                instance.folder_logo = base64.b64decode(folder_logo_b64)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance
    


class StudentRequestCompanySerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='student_id.user_name', read_only=True)

    class Meta:
        model = student_request
        fields = ['id','student_id', 'user_name', 'status', 'remarks']

class SkillTypeSerializer_filterModal(serializers.ModelSerializer):
    class Meta:
        model = skill_type
        fields = ['id', 'skill_type', 'question_type_id']


class SkillTypeSerializer_filter_new(serializers.ModelSerializer):
    class Meta:
        model = skill_type
        fields = ['id', 'skill_type', 'question_type_id']
       