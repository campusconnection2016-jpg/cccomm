from django.db import models
from django.contrib.auth.models import User

class appinfo(models.Model):
    info_code= models.CharField(max_length=50,null=True, blank=True)
    info_value= models.CharField(max_length=255,null=True, blank=True)
    deleted= models.IntegerField(default=0, null=True, blank=True)
    created_by= models.CharField(max_length=100,null=True, blank=True)
    dtm_created= models.DateTimeField(null=True, blank=True)
    modified_by= models.CharField(max_length=100,null=True, blank=True)
    dtm_modified= models.DateTimeField(null=True, blank=True)
    remarks= models.TextField(max_length=1000,null=True, blank=True)
    dev_remarks= models.TextField(max_length=1000,null=True, blank=True)

class test_master(models.Model):
    test_name= models.CharField(max_length=255,null=True,unique=True, blank=True)
    test_type_id=models.ForeignKey('test_type',on_delete=models.CASCADE,null=True, blank=True)
    skill_type_id= models.ForeignKey('skill_type',on_delete=models.CASCADE,null=True, blank=True)
    question_type_id=models.ForeignKey('question_type',on_delete=models.CASCADE,null=True, blank=True)

    company_name=models.CharField(max_length=1000,null=True, blank=True)
    company_email=models.EmailField(null=True, blank=True)
    is_company=models.BooleanField(default=False)
    round_of_interview=models.CharField(max_length=255,null=True, blank=True)
    student_ids = models.JSONField(default=list) 
    students_count= models.IntegerField(null=True, blank=True)
    dtm_start= models.DateTimeField(null=True, blank=True)
    temp1= models.TextField(max_length=1000,null=True, blank=True)
    dtm_end= models.DateTimeField(null=True, blank=True)
    duration= models.IntegerField(null=True, blank=True)
    year= models.CharField(max_length=50,null=True, blank=True)
    need_candidate_info= models.BooleanField(default=False)
    deleted= models.IntegerField(default=0, null=True, blank=True)
    created_by= models.CharField(max_length=100,null=True, blank=True)
    dtm_created= models.DateTimeField(null=True, blank=True)
    modified_by= models.CharField(max_length=100,null=True, blank=True)
    dtm_modified= models.DateTimeField(null=True, blank=True)
    remarks= models.TextField(max_length=1000,null=True, blank=True)
    dev_remarks= models.TextField(max_length=1000,null=True, blank=True)    
    
    class Meta:
        indexes = [
            models.Index(fields=['test_name'], name='test_master_frgkey_idx'),
            models.Index(fields=['test_type_id',], name='ts_master_ts_type_idx'),
            models.Index(fields=['skill_type_id'], name='ts_skilltype_idx'),
            models.Index(fields=['question_type_id'], name='test_master_qstype_idx'),
        ]
    
class candidate_master(models.Model):
    students_name= models.CharField(max_length=255,null=True, blank=True)
    batch_no=models.CharField(max_length=255,null=True, blank=True)
    user_name= models.CharField(max_length=100,unique=True,null=True, blank=True)
    college_id=models.ForeignKey('college_master',on_delete=models.CASCADE, null=True, blank=True)
    registration_number= models.CharField(max_length=255,null=True, blank=True)
    gender= models.CharField(max_length=255,null=True, blank=True)
    email_id= models.EmailField(null=True, blank=True)
    mobile_number= models.CharField(max_length=255,null=True, blank=True)
    department_id=models.ForeignKey('department_master',on_delete=models.CASCADE, null=True, blank=True)
    year= models.CharField(max_length=50, null=True, blank=True)
    cgpa = models.DecimalField(max_digits=5, decimal_places=2,default=0.0, null=True, blank=True)
    marks_10th = models.DecimalField(max_digits=5, decimal_places=2, default=0.0, null=True, blank=True)
    marks_12th = models.DecimalField(max_digits=5, decimal_places=2, default=0.0, null=True, blank=True)
    marks_semester_wise= models.CharField(max_length=1000,null=True, blank=True)
    history_of_arrears = models.IntegerField(default=0, null=True, blank=True)
    standing_arrears= models.IntegerField(default=0, null=True, blank=True)
    core_of_offers= models.IntegerField(default=0, null=True, blank=True)
    it_of_offers= models.IntegerField(default=0, null=True, blank=True)
    is_offered=models.BooleanField(default=False)
    number_of_offers= models.IntegerField(default=0, null=True, blank=True)
    text=models.TextField(max_length=1000,null=True, blank=True)
    skill_id = models.ManyToManyField('skills_master', blank=True)
    need_candidate_info= models.BooleanField(null=True, blank=True)  
    is_database= models.BooleanField(null=True, blank=True)
    dtm_upload = models.DateTimeField(null=True, blank=True)
    resume_link = models.URLField(blank=True, null=True)
    photo_link = models.URLField(blank=True, null=True)
    deleted= models.IntegerField(default=0, null=True, blank=True)
    created_by= models.CharField(max_length=100,null=True, blank=True)
    dtm_created= models.DateTimeField(null=True, blank=True)
    modified_by= models.CharField(max_length=100,null=True, blank=True)
    dtm_modified= models.DateTimeField(null=True, blank=True)
    remarks= models.TextField(max_length=1000,null=True, blank=True)
    dev_remarks= models.TextField(max_length=1000,null=True, blank=True)
    
    class Meta:
       indexes = [
        models.Index(fields=['college_id']),
        models.Index(fields=['department_id']),
        models.Index(fields=['deleted']),
        models.Index(fields=['dtm_upload']),
       
    ]

class question_paper_master(models.Model):
    question_paper_name= models.CharField(max_length=255,null=True, blank=True)
    duration_of_test= models.IntegerField(null=True, blank=True)
    upload_type= models.CharField(max_length=1000,null=True, blank=True)
    no_of_questions= models.IntegerField(null=True, blank=True)
    test_type=models.CharField(max_length=1000,null=True, blank=True)
    topic=models.CharField(max_length=255,null=True, blank=True)
    sub_topic=models.CharField(max_length=255,null=True,blank=True)
    folder_name=models.CharField(max_length=255,null=True,blank=True)
    file_url=models.TextField(max_length=1000,null=True, blank=True)
    is_testcase= models.BooleanField(default=False)
    deleted= models.IntegerField(default=0, null=True, blank=True)
    created_by= models.CharField(max_length=100,null=True, blank=True)
    dtm_created= models.DateTimeField(null=True, blank=True)
    modified_by= models.CharField(max_length=100,null=True, blank=True)
    communication_category= models.TextField(max_length=1000,null=True, blank=True)
    remarks= models.TextField(max_length=1000,null=True, blank=True)
    audio_text= models.TextField(max_length=1000,null=True, blank=True)
    class Meta:
        indexes = [
            models.Index(fields=['question_paper_name']),
            models.Index(fields=['test_type']),
            models.Index(fields=['topic']),
            models.Index(fields=['sub_topic']),
            models.Index(fields=['deleted']),
            models.Index(fields=['dtm_created']),
        ]

   
class question_master_temp(models.Model):
    question_name_id= models.ForeignKey('question_paper_master',on_delete=models.CASCADE,null=True, blank=True)
    question_text= models.TextField(max_length=1000,null=True, blank=True)
    question_image_data = models.BinaryField(null=True,blank=True)
    option_a_image_data = models.BinaryField(null=True,blank=True)
    option_b_image_data = models.BinaryField(null=True,blank=True)
    option_c_image_data = models.BinaryField(null=True,blank=True)
    option_d_image_data = models.BinaryField(null=True,blank=True)
    option_e_image_data = models.BinaryField(null=True,blank=True)
    difficulty_level=models.CharField(max_length=255,null=True, blank=True)
    option_a= models.TextField(max_length=1000,null=True, blank=True)
    option_b= models.TextField(max_length=1000,null=True, blank=True)
    option_c= models.TextField(max_length=1000,null=True, blank=True)
    option_d= models.TextField(max_length=1000,null=True, blank=True)
    option_e= models.TextField(max_length=1000,null=True, blank=True)
    test_case1=models.TextField(max_length=1000,null=True, blank=True)
    test_case2=models.TextField(max_length=1000,null=True, blank=True)
    test_case3=models.TextField(max_length=1000,null=True, blank=True)
    mark_method=models.CharField(max_length=255,null=True,blank=True)
    sections= models.TextField(max_length=1000,null=True, blank=True)
    answer= models.TextField(max_length=1000,null=True, blank=True)
    negative_mark= models.IntegerField(null=True, blank=True)
    mark= models.IntegerField(null=True, blank=True)
    explain_answer= models.TextField(max_length=1000,null=True, blank=True)
    input_format = models.TextField(max_length=2000, null=True, blank=True)
    

class question_master(models.Model):
    question_name_id= models.ForeignKey('question_paper_master',on_delete=models.CASCADE,null=True, blank=True, db_index=True)
    question_text= models.TextField(max_length=20000,null=True, blank=True)
    difficulty_level=models.CharField(max_length=255,null=True, blank=True)
    question_image_data = models.BinaryField(null=True,blank=True)
    option_a_image_data = models.BinaryField(null=True,blank=True)
    option_b_image_data = models.BinaryField(null=True,blank=True)
    option_c_image_data = models.BinaryField(null=True,blank=True)
    option_d_image_data = models.BinaryField(null=True,blank=True)
    option_e_image_data = models.BinaryField(null=True,blank=True)
    option_a= models.TextField(max_length=1000,null=True, blank=True)
    option_b= models.TextField(max_length=1000,null=True, blank=True)
    option_c= models.TextField(max_length=1000,null=True, blank=True)
    option_d= models.TextField(max_length=1000,null=True, blank=True)
    option_e= models.TextField(max_length=1000,null=True, blank=True)
    option_f= models.TextField(max_length=1000,null=True, blank=True)
    mark_method=models.CharField(max_length=255,null=True,blank=True)
    answer= models.TextField(max_length=20000,null=True, blank=True)
    sections= models.TextField(max_length=1000,null=True, blank=True)
    negative_mark= models.IntegerField(null=True, blank=True)
    mark= models.IntegerField(null=True, blank=True)
    view_hint= models.TextField(max_length=1000,null=True, blank=True)
    explain_answer= models.TextField(max_length=20000,null=True, blank=True)
    is_active= models.BooleanField(default=False)
    input_format = models.TextField(max_length=20000, null=True, blank=True)
    test_case1=models.TextField(max_length=1000,null=True, blank=True)
    test_case2=models.TextField(max_length=1000,null=True, blank=True)
    test_case3=models.TextField(max_length=1000,null=True, blank=True)
    deleted= models.IntegerField(default=0, null=True, blank=True, db_index=True)
    created_by= models.CharField(max_length=100,null=True, blank=True)
    dtm_created= models.DateTimeField(null=True, blank=True)
    modified_by= models.CharField(max_length=100,null=True, blank=True)
    dtm_modified= models.DateTimeField(null=True, blank=True)
    remarks= models.TextField(max_length=1000,null=True, blank=True)
    dev_remarks= models.TextField(max_length=1000,null=True, blank=True)
    
    class Meta:
        indexes = [
           models.Index(fields=['deleted']),
        
           models.Index(fields=['question_name_id']),
    ]

class skills_master(models.Model):
    skill_name= models.CharField(max_length=255,null=True, blank=True)
    skill_type_id=models.ForeignKey('skill_type',on_delete=models.CASCADE,null=True, blank=True)
    deleted= models.IntegerField(default=0, null=True, blank=True)
    created_by= models.CharField(max_length=100,null=True, blank=True)
    dtm_created= models.DateTimeField(null=True, blank=True)
    modified_by= models.CharField(max_length=100,null=True, blank=True)
    dtm_modified= models.DateTimeField(null=True, blank=True)
    remarks= models.TextField(max_length=1000,null=True, blank=True)
    dev_remarks= models.TextField(max_length=1000,null=True, blank=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['skill_type_id']),
          
            models.Index(fields=['deleted']),
        ]

    

class skill_type(models.Model):
    skill_type= models.CharField(max_length=255,null=True, blank=True)
    question_type_id=models.ForeignKey('question_type',on_delete=models.CASCADE,null=True, blank=True)
    deleted= models.IntegerField(default=0, null=True, blank=True)
    created_by= models.CharField(max_length=100,null=True, blank=True)
    dtm_created= models.DateTimeField(null=True, blank=True)
    modified_by= models.CharField(max_length=100,null=True, blank=True)
    dtm_modified= models.DateTimeField(null=True, blank=True)
    remarks= models.TextField(max_length=1000,null=True, blank=True)
    dev_remarks= models.TextField(max_length=1000,null=True, blank=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['question_type_id'], name='ques_typs_idx'),
            models.Index(fields=['skill_type'], name='skill_typs_idx'),
            models.Index(fields=['deleted']),
        ]
    
class login(models.Model):
    mobile_number= models.CharField(max_length=255,null=True, blank=True)
    otp_code = models.CharField(max_length=6, null=True, blank=True)   # for OTP
    otp_created_at = models.DateTimeField(null=True, blank=True)
    email_id= models.EmailField(null=True, blank=True)
    user_name= models.CharField(max_length=100,unique=True)
    password= models.CharField(max_length=100,null=True, blank=True)
    role= models.CharField(max_length=100,null=True, blank=True)
    college_id=models.ForeignKey('college_master',on_delete=models.CASCADE, null=True, blank=True)
    dtm_trainer=models.DateTimeField(null=True, blank=True)
    deleted= models.IntegerField(default=0, null=True, blank=True)
    created_by= models.CharField(max_length=100,null=True, blank=True)
    dtm_created= models.DateTimeField(null=True, blank=True)
    modified_by= models.CharField(max_length=100,null=True, blank=True)
    dtm_modified= models.DateTimeField(null=True, blank=True)
    remarks= models.TextField(max_length=1000,null=True, blank=True)
    dev_remarks= models.TextField(max_length=1000,null=True, blank=True)
    dtm_login= models.DateTimeField(null=True, blank=True)
    dtm_logout= models.DateTimeField(null=True, blank=True)
    is_active=models.BooleanField(null=True, blank=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['college_id'], name='login_clg_idx'),
            models.Index(fields=['user_name'], name='login_user_idx'),  # assuming login uses this
            models.Index(fields=['deleted'], name='login_deleted_idx'),  # if used for filtering
        ]

class test_type(models.Model):
    test_type= models.CharField(max_length=255,null=True, blank=True)
    test_type_categories = models.CharField(max_length=255, null=True, blank=True)
    deleted= models.IntegerField(default=0, null=True, blank=True)
    created_by= models.CharField(max_length=100,null=True, blank=True)
    dtm_created= models.DateTimeField(null=True, blank=True)
    modified_by= models.CharField(max_length=100,null=True, blank=True)
    dtm_modified= models.DateTimeField(null=True, blank=True)
    remarks= models.TextField(max_length=1000,null=True, blank=True)
    dev_remarks= models.TextField(max_length=1000,null=True, blank=True)
    class Meta:
        indexes = [
           
            models.Index(fields=['deleted'],name='testty_deleted_idx'),
        ]
    

class question_type(models.Model):
    question_type=models.CharField(max_length=255,null=True, blank=True)
    deleted= models.IntegerField(default=0, null=True, blank=True)
    created_by= models.CharField(max_length=100,null=True, blank=True)
    dtm_created= models.DateTimeField(null=True, blank=True)
    modified_by= models.CharField(max_length=100,null=True, blank=True)
    dtm_modified= models.DateTimeField(null=True, blank=True)
    remarks= models.TextField(max_length=1000,null=True, blank=True)
    dev_remarks= models.TextField(max_length=1000,null=True, blank=True)
    class Meta:
        indexes = [
            models.Index(fields=['question_type'], name='question_type_idx'),
        
            models.Index(fields=['deleted'], name='que_type_delete_idx'),
        ]
    
                                                             
class content_master(models.Model):
    content_url= models.TextField(max_length=1000,null=True, blank=True)
    actual_content= models.TextField(max_length=1000,null=True, blank=True)
    status= models.CharField(max_length=255,null=True, blank=True)
    added_by= models.TextField(max_length=1000,null=True, blank=True)
    topic=models.CharField(max_length=255,null=True, blank=True)
    sub_topic=models.CharField(max_length=255,null=True, unique=True,blank=True)
  
    dtm_validity= models.DateTimeField(null=True, blank=True)
    feedback= models.TextField(max_length=1000,null=True, blank=True)
    skill_type_id=models.ForeignKey('skill_type',on_delete=models.CASCADE,null=True, blank=True)
    question_type_id=models.ForeignKey('question_type',on_delete=models.CASCADE,null=True, blank=True)
    worksheet_link= models.TextField(max_length=1000,null=True, blank=True)
    deleted= models.IntegerField(default=0, null=True, blank=True)
    created_by= models.CharField(max_length=100,null=True, blank=True)
    dtm_created= models.DateTimeField(null=True, blank=True)
    modified_by= models.CharField(max_length=100,null=True, blank=True)
    dtm_modified= models.DateTimeField(null=True, blank=True)
    remarks= models.TextField(max_length=1000,null=True, blank=True)
    dev_remarks= models.TextField(max_length=1000,null=True, blank=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['skill_type_id'], name='skill_cont_mas_idx'),
            models.Index(fields=['question_type_id'], name='ques_cont_mas_idx'),
            models.Index(fields=['sub_topic'], name='sub_topic_idx'),
            models.Index(fields=['topic'], name='topic_idx'),
            models.Index(fields=['deleted'], name='dele_idx'),
        ]


class college_master(models.Model):
    college= models.CharField(max_length=255,null=True, blank=True)
    college_logo= models.BinaryField(null=True,blank=True)
    college_code=models.CharField(max_length=250,null=True, blank=True)
    college_group= models.TextField(max_length=1000,null=True, blank=True)
    spoc_name=models.CharField(max_length=250,null=True, blank=True)
    spoc_no=models.CharField(max_length=250,null=True, blank=True)
    email=models.EmailField(null=True, blank=True)
    level_of_access=models.CharField(max_length=250,null=True, blank=True)
    stay_incharge_name=models.CharField(max_length=250,null=True, blank=True)
    stay_incharge_no=models.CharField(max_length=250,null=True, blank=True)
    trans_incharge_name=models.CharField(max_length=250,null=True, blank=True)
    trans_incharge_no=models.CharField(max_length=250,null=True, blank=True)
    deleted= models.IntegerField(default=0, null=True, blank=True)
    created_by= models.CharField(max_length=100,null=True, blank=True)
    dtm_created= models.DateTimeField(null=True, blank=True)
  #  instruction=models.TextField(max_length=1000,null=True, blank=True)
   
    class Meta:
        indexes = [
            models.Index(fields=['college'], name='clg_details_idx'),
            models.Index(fields=['college_group'], name='clg_group_idx'),
        
            models.Index(fields=['deleted'], name='clg_deleted_idx'),
          
            models.Index(fields=['college_code'], name='clg_code_idx'),
    ]
    
class department_master(models.Model):
    department= models.CharField(max_length=255,null=True, blank=True)
    deleted= models.IntegerField(default=0, null=True, blank=True)
    created_by= models.CharField(max_length=100,null=True, blank=True)
    dtm_created= models.DateTimeField(null=True, blank=True)
    modified_by= models.CharField(max_length=100,null=True, blank=True)
    dtm_modified= models.DateTimeField(null=True, blank=True)
    remarks= models.TextField(max_length=1000,null=True, blank=True)
    dev_remarks= models.TextField(max_length=1000,null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=['department'], name='dept_idx'),
        ]
    

class topic_master(models.Model):
    topic= models.CharField(max_length=255,null=True, blank=True)
    sub_topic= models.CharField(max_length=255,null=True, blank=True)
    is_active= models.BooleanField(default=False)
    deleted= models.IntegerField(default=0, null=True, blank=True)
    created_by= models.CharField(max_length=100,null=True, blank=True)
    dtm_created= models.DateTimeField(null=True, blank=True)
    modified_by= models.CharField(max_length=100,null=True, blank=True)
    dtm_modified= models.DateTimeField(null=True, blank=True)
    remarks= models.TextField(max_length=1000,null=True, blank=True)
    dev_remarks= models.TextField(max_length=1000,null=True, blank=True)
    

class tests_candidates_map(models.Model):
    test_name=models.CharField(max_length=255, null=True, blank=True)
    question_id=models.ForeignKey('question_paper_master',on_delete=models.CASCADE, null=True, blank=True)
    question_ids=models.JSONField(default=list, null=True, blank=True)
    no_of_question= models.IntegerField(null=True, blank=True)
    student_id=models.ForeignKey('candidate_master',on_delete=models.CASCADE, null=True, blank=True)
    college_id=models.ForeignKey('college_master',on_delete=models.CASCADE, null=True, blank=True)
    department_id=models.ForeignKey('department_master',on_delete=models.CASCADE, null=True, blank=True)
    dtm_start= models.DateTimeField(null=True, blank=True)
    dtm_end= models.DateTimeField(null=True, blank=True)
    dtm_start1= models.DateTimeField(null=True, blank=True)
    dtm_end1= models.DateTimeField(null=True, blank=True)
    dtm_login= models.DateTimeField(null=True, blank=True)
    dtm_submit= models.DateTimeField(null=True, blank=True)
    dtm_start_test= models.DateTimeField(null=True, blank=True)
    status= models.CharField(max_length=255, null=True, blank=True)
    is_reassigned=models.BooleanField(default=False)
    is_camera_on= models.BooleanField(default=False, null=True)
    duration= models.IntegerField(null=True, blank=True)
    duration_type= models.CharField(max_length=255, null=True, blank=True)
    capture_duration = models.CharField(max_length=255, null=True, blank=True)
    year= models.CharField(max_length=50,null=True, blank=True)
    rules_id= models.ForeignKey('rules',on_delete=models.CASCADE,null=True, blank=True)
    video_required= models.BooleanField(default=False)
    is_active= models.BooleanField(default=False)
    need_candidate_info= models.BooleanField(default=False)
    total_score = models.IntegerField(null=True, blank=True)
    avg_mark = models.IntegerField(null=True, blank=True)
    attempt_count= models.IntegerField(null=True, blank=True)
    stu_avg_mark = models.IntegerField(null=True, blank=True)
    assign_count= models.IntegerField(null=True, blank=True)
    is_upload_type = models.CharField(default='System Generator', max_length=255, null=True, blank=True)
    capture_passkey = models.CharField(max_length=255, null=True, blank=True)
    deleted= models.IntegerField(default=0, null=True, blank=True)
    created_by= models.CharField(max_length=100,null=True, blank=True)
    dtm_created= models.DateTimeField(null=True, blank=True)
    modified_by= models.CharField(max_length=100,null=True, blank=True)
    dtm_modified= models.DateTimeField(null=True, blank=True)
    tab_move_count= models.IntegerField(null=True, blank=True)
    
   # user_role=models.CharField(max_length=100,null=True, blank=True)
  
    class Meta:
        indexes = [
            models.Index(fields=['student_id'], name='testmap_stu_frg_idx'),
            models.Index(fields=['question_id'], name='testmap_ques_frg_idx'),
            models.Index(fields=['college_id'], name='testmap_clg_frg_idx'),
         #   models.Index(fields=['rules_id'], name='testmap_rules_idx'),
            models.Index(fields=['department_id'], name='testmap_dept_frg_idx'),
            models.Index(fields=['test_name'], name='test_name_idx'),
            models.Index(fields=['total_score'], name='total_score_idx'),
            models.Index(fields=['deleted'], name='delete_idx'),
        ]


class tests_candidates_answers(models.Model):
    student_id=models.ForeignKey('candidate_master',on_delete=models.CASCADE,null=True, blank=True)
    test_name=models.CharField(max_length=1000,null=True, blank=True)
    question_id= models.ForeignKey('question_master', on_delete=models.CASCADE, null=True, blank=True)
    answer= models.TextField(max_length=30000,null=True, blank=True)
    result= models.IntegerField(null=True, blank=True)
    dtm_start = models.DateTimeField(null=True, blank=True)
    submission_compile_code = models.TextField(max_length=30000, null=True, blank=True)
    compile_code_editor = models.TextField(max_length=30000, null=True, blank=True)
    test_case1=models.TextField(max_length=1000,null=True, blank=True)
    test_case2=models.TextField(max_length=1000,null=True, blank=True)
    test_case3=models.TextField(max_length=1000,null=True, blank=True)
    dtm_end = models.DateTimeField(null=True, blank=True)
    deleted= models.IntegerField(default=0, null=True, blank=True)
    created_by= models.CharField(max_length=100,null=True, blank=True)
    dtm_created= models.DateTimeField(null=True, blank=True)
    modified_by= models.CharField(max_length=100,null=True, blank=True)
    dtm_modified= models.DateTimeField(null=True, blank=True)
    remarks= models.TextField(max_length=1000,null=True, blank=True)
    dev_remarks= models.TextField(max_length=1000,null=True, blank=True)

    class Meta:
        
        indexes = [
            models.Index(fields=['student_id'], name='test_ans_stu_frg_idx'),
            models.Index(fields=['test_name'], name='test_ans_idx'),
        ]
    

class course_schedule(models.Model):
    college_id=models.ForeignKey('college_master',on_delete=models.CASCADE,null=True, blank=True)
    department_id=models.ForeignKey('department_master',on_delete=models.CASCADE,null=True, blank=True)
    year= models.CharField(max_length=50,null=True, blank=True)    
    batch_no=models.CharField(max_length=255,null=True, blank=True)
    topic_id= models.ForeignKey('content_master', on_delete=models.CASCADE,null=True, blank=True)
    student_id=models.ForeignKey('candidate_master',on_delete=models.CASCADE,null=True, blank=True)
    trainer_ids= models.JSONField(default=list, null=True, blank=True)
    dtm_start_student= models.DateTimeField(null=True, blank=True)
    dtm_end_student= models.DateTimeField(null=True, blank=True)
    dtm_start_trainer= models.DateTimeField(null=True, blank=True)
    dtm_end_trainer= models.DateTimeField(null=True, blank=True)
    dtm_of_training= models.DateTimeField(null=True, blank=True)
    course_mode= models.CharField(max_length=255,null=True, blank=True)
    status= models.TextField(max_length=1000,null=True, blank=True)
    trainer_payment=models.CharField(max_length=255,null=True, blank=True) 
    travel=models.CharField(max_length=255,null=True, blank=True) 
    food=models.CharField(max_length=255,null=True, blank=True) 
    feedback= models.TextField(max_length=1000,null=True, blank=True)
    deleted= models.IntegerField(default=0, null=True, blank=True)
    created_by= models.CharField(max_length=100,null=True, blank=True)
    dtm_created= models.DateTimeField(null=True, blank=True)
    modified_by= models.CharField(max_length=100,null=True, blank=True)
    dtm_modified= models.DateTimeField(null=True, blank=True)
    remarks= models.TextField(max_length=1000,null=True, blank=True)
    dev_remarks= models.TextField(max_length=1000,null=True, blank=True)

    class Meta:
        indexes = [
            # Keep only if you filter on these fields
            models.Index(fields=['college_id', 'department_id', 'year'], name='idx_clg_dept_year'),
         
            models.Index(fields=['student_id'], name='idx_student_course'),
            models.Index(fields=['dtm_of_training'], name='idx_dtm_training'),
        ]

class trainer_master(models.Model):
    trainer_name= models.CharField(max_length=255,null=True, blank=True)
    batch_no=models.CharField(max_length=255,null=True, blank=True)
    location= models.TextField(max_length=1000,null=True, blank=True)
    certification= models.TextField(max_length=5000,null=True, blank=True)
    pan_number= models.TextField(max_length=1000,null=True, blank=True)
    gst= models.TextField(max_length=1000,null=True, blank=True)
    photo= models.BinaryField(null=True,blank=True)
    experience= models.TextField(max_length=1000,null=True, blank=True)
    country= models.CharField(max_length=255,null=True, blank=True)
    qualification= models.TextField(max_length=1000,null=True, blank=True)
    is_active= models.BooleanField(default=False)
    state= models.CharField(max_length=255,null=True, blank=True)
    city= models.CharField(max_length=255,null=True, blank=True)
    mobile_no= models.CharField(max_length=255,null=True, blank=True)
    email_id= models.EmailField(null=True, blank=True)
    skill_id = models.ManyToManyField('skill_type', blank=True)
    languages_known= models.TextField(max_length=1000,null=True, blank=True)
    bank_name= models.TextField(max_length=1000,null=True, blank=True)
    ifsc_code= models.TextField(max_length=1000,null=True, blank=True)
    branch_name= models.TextField(max_length=1000,null=True, blank=True)
    account_no= models.TextField(max_length=1000,null=True, blank=True)
    resume = models.FileField(upload_to='resume/',null=True, blank=True)
    user_name = models.CharField(max_length=255,null=True, blank=True)
    address=models.CharField(max_length=2500,null=True, blank=True)
    is_terms = models.BooleanField(default=False)
    is_edit = models.BooleanField(default=False)
    trainer_popup = models.BooleanField(default=False)
    deleted= models.IntegerField(default=0, null=True, blank=True)
    created_by= models.CharField(max_length=100,null=True, blank=True)
    dtm_created= models.DateTimeField(null=True, blank=True)
    modified_by= models.CharField(max_length=100,null=True, blank=True)
    dtm_modified= models.DateTimeField(null=True, blank=True)
    remarks= models.TextField(max_length=1000,null=True, blank=True)
    dev_remarks= models.TextField(max_length=1000,null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=['trainer_name'], name='trainer_city_name_idx'),
            models.Index(fields=['email_id'], name='trainer_email_idx'),  # used for login/search?
             
        ]

class course_content_feedback(models.Model):
    student_id=models.ForeignKey('candidate_master',on_delete=models.CASCADE,null=True, blank=True)
    training_id=models.ForeignKey('training_schedule',on_delete=models.CASCADE,null=True, blank=True)
    topic_id=models.ForeignKey('content_master',on_delete=models.CASCADE,null=True, blank=True)
    dtm_session= models.DateTimeField(null=True, blank=True)
    trainer_id=models.ForeignKey('trainer_master',on_delete=models.CASCADE,null=True, blank=True)
    feedback= models.TextField(max_length=1000,null=True, blank=True)
    deleted= models.IntegerField(default=0, null=True, blank=True)
    created_by= models.CharField(max_length=100,null=True, blank=True)
    dtm_created= models.DateTimeField(null=True, blank=True)
    modified_by= models.CharField(max_length=100,null=True, blank=True)
    dtm_modified= models.DateTimeField(null=True, blank=True)
    remarks= models.TextField(max_length=1000,null=True, blank=True)
    dev_remarks= models.TextField(max_length=1000,null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=['student_id']),
            models.Index(fields=['trainer_id']),
            models.Index(fields=['topic_id']),
            models.Index(fields=['dtm_session']),
        ]


class rules(models.Model):
     rule_name=models.CharField(max_length=100,null=True, blank=True)
     instruction=models.TextField(max_length=1000,null=True, blank=True)
     deleted= models.IntegerField(default=0, null=True, blank=True)
     created_by= models.CharField(max_length=100,null=True, blank=True)
     dtm_created= models.DateTimeField(null=True, blank=True)
     modified_by= models.CharField(max_length=100,null=True, blank=True)
     dtm_modified= models.DateTimeField(null=True, blank=True)
     remarks= models.TextField(max_length=1000,null=True, blank=True)
     dev_remarks= models.TextField(max_length=1000,null=True, blank=True)
    

class company_master(models.Model):
    company_name= models.CharField(max_length=1000,null=True, blank=True)
    company_profile= models.TextField(max_length=5000,null=True, blank=True)
    deleted= models.IntegerField(default=0)
    created_by= models.CharField(max_length=100,null=True, blank=True)
    dtm_created= models.DateTimeField(null=True, blank=True)
    modified_by= models.CharField(max_length=100,null=True, blank=True)
    dtm_modified= models.DateTimeField(null=True, blank=True)
    remarks= models.TextField(max_length=1000,null=True, blank=True)
    dev_remarks= models.TextField(max_length=1000,null=True, blank=True)


class course_trainer_feedback(models.Model):
    trainer_id=models.ForeignKey('trainer_master',on_delete=models.CASCADE,null=True, blank=True)
    college_id=models.ForeignKey('college_master',on_delete=models.CASCADE,null=True, blank=True)
    department_id=models.ForeignKey('department_master',on_delete=models.CASCADE,null=True, blank=True)
    topic_id=models.ForeignKey('topic_master',on_delete=models.CASCADE,null=True, blank=True)
    dtm_complete= models.DateTimeField(null=True, blank=True)
    completion_status= models.CharField(max_length=255,null=True, blank=True)
    feedback= models.TextField(max_length=1000,null=True, blank=True)
    deleted= models.IntegerField(default=0,null=True, blank=True)
    created_by= models.CharField(max_length=100,null=True, blank=True)
    dtm_created= models.DateTimeField(null=True, blank=True)
    modified_by= models.CharField(max_length=100,null=True, blank=True)
    dtm_modified= models.DateTimeField(null=True, blank=True)
    remarks= models.TextField(max_length=1000,null=True, blank=True)
    dev_remarks= models.TextField(max_length=1000,null=True, blank=True)
    class Meta:
       
        indexes = [
        models.Index(fields=['college_id'], name='idx_feedback_college'),
        models.Index(fields=['department_id'], name='idx_feedback_department'),
        models.Index(fields=['topic_id'], name='idx_feedback_topic'),
        models.Index(fields=['dtm_complete'], name='idx_feedback_dtmcomplete'),
        models.Index(fields=['completion_status'], name='idx_feedback_status'),
    
        ]


class student_request(models.Model):
    student_id = models.ForeignKey('candidate_master',on_delete=models.CASCADE, null=True, blank=True)
    dtm_request= models.DateTimeField(null=True, blank=True)
    student_query= models.CharField(max_length=255,null=True, blank=True)
    approved_by= models.CharField(max_length=255,null=True, blank=True)
    dtm_approved= models.DateTimeField(null=True, blank=True)
    dtm_student_update= models.DateTimeField(null=True, blank=True)
    status= models.CharField(max_length=255,null=True, blank=True,default="Pending")
    is_query_type = models.CharField(max_length=255, null=True, blank=True, default='Profile')
    deleted= models.IntegerField(default=0, null=True, blank=True)
    created_by= models.CharField(max_length=100,null=True, blank=True)
    dtm_created= models.DateTimeField(null=True, blank=True)
    modified_by= models.CharField(max_length=100,null=True, blank=True)
    dtm_modified= models.DateTimeField(null=True, blank=True)
    remarks= models.TextField(max_length=1000,null=True, blank=True)
    dev_remarks= models.TextField(max_length=1000,null=True, blank=True)
    class Meta:
        indexes = [
            models.Index(fields=['student_id'], name='idx_student_id'),
            models.Index(fields=['status'], name='idx_sta'),
            models.Index(fields=['dtm_request'], name='idx_request_date'),
        ]

class eligible_student_list(models.Model):
    students_id= models.ForeignKey('candidate_master',on_delete=models.CASCADE, null=True, blank=True)
    announcement= models.TextField(max_length=10000,null=True, blank=True)
    job_id=models.ForeignKey('job_offers',on_delete=models.CASCADE, null=True, blank=True)
    round_of_interview=models.CharField(max_length=255,null=True, blank=True)
    announcement_image= models.BinaryField(null=True,blank=True)
    is_accept=models.BooleanField(default=False)
    is_eligible=models.BooleanField(default=False)
    batch_name=models.CharField(max_length=255,null=True, blank=True)
    whatsapp_text=models.TextField(max_length=10000,null=True, blank=True)
    deleted= models.IntegerField(default=0, null=True, blank=True)
    created_by= models.CharField(max_length=100,null=True, blank=True)
    dtm_created= models.DateTimeField(null=True, blank=True)
    modified_by= models.CharField(max_length=100,null=True, blank=True)
    dtm_modified= models.DateTimeField(null=True, blank=True)
    remarks= models.TextField(max_length=1000,null=True, blank=True)
    dev_remarks= models.TextField(max_length=1000,null=True, blank=True)
    class Meta:
        indexes = [
            models.Index(fields=['students_id'], name='eligible_batch_idx'),
            models.Index(fields=['job_id'], name='eligible_job_idx'),
            models.Index(fields=['is_accept'], name='eligible_accept_idx'),
            models.Index(fields=['is_eligible'], name='eligible_eligible_idx'),
            models.Index(fields=['round_of_interview'], name='eligible_round_idx'),
        ]

class Screenshots(models.Model):
    test_candidate_id=models.ForeignKey('tests_candidates_map',on_delete=models.CASCADE, null=True, blank=True)
    screenshots= models.BinaryField(null=True,blank=True)
    dtm_created= models.DateTimeField(null=True, blank=True)
    deleted= models.IntegerField(default=0, null=True, blank=True)
    created_by= models.CharField(max_length=100,null=True, blank=True)
    modified_by= models.CharField(max_length=100,null=True, blank=True)
    dtm_modified= models.DateTimeField(null=True, blank=True)
    remarks= models.TextField(max_length=1000,null=True, blank=True)
    dev_remarks= models.TextField(max_length=1000,null=True, blank=True)
    indexes = [
        models.Index(fields=['test_candidate_id'], name='idx_test_candidate_id'),      
    ]
    

class trainers_report(models.Model):
    course_schedule_id=models.ForeignKey('course_schedule',on_delete=models.CASCADE, null=True, blank=True)
    no_of_question_solved=models.IntegerField(default=0, null=True, blank=True)
    comments=models.CharField(max_length=1000,null=True, blank=True)
    training_schedule_id=models.ForeignKey('training_schedule',on_delete=models.CASCADE, null=True, blank=True)

    activities_done=models.BooleanField(default=False)
    status=models.CharField(max_length=255,null=True, blank=True)
    student_feedback=models.CharField(max_length=255,null=True, blank=True)
    infrastructure_feedback=models.CharField(max_length=255,null=True, blank=True)
    dtm_created= models.DateTimeField(null=True, blank=True)
    deleted= models.IntegerField(default=0, null=True, blank=True)
    created_by= models.CharField(max_length=100,null=True, blank=True)
    modified_by= models.CharField(max_length=100,null=True, blank=True)
    dtm_modified= models.DateTimeField(null=True, blank=True)
    remarks= models.TextField(max_length=1000,null=True, blank=True)
    dev_remarks= models.TextField(max_length=1000,null=True, blank=True)
    class Meta:
        indexes = [
            models.Index(fields=['course_schedule_id'], name='idx_course_sch'),
            models.Index(fields=['status'], name='idx_status'),
            models.Index(fields=['activities_done'], name='idx_activities_done'),
            models.Index(fields=['no_of_question_solved'], name='idx_question_solved'),
        ]


class test_reports(models.Model):
    test_name = models.CharField(max_length=255, null=True, blank=True)
    college_id = models.ForeignKey('college_master', on_delete=models.CASCADE, null=True, blank=True)
    department_id = models.ForeignKey('department_master', on_delete=models.CASCADE, null=True, blank=True)
    year = models.CharField(max_length=255, null=True, blank=True)
    students_count = models.IntegerField(default=0, null=True, blank=True)
    deleted= models.IntegerField(default=0, null=True, blank=True)
    created_by= models.CharField(max_length=100,null=True, blank=True)
    modified_by= models.CharField(max_length=100,null=True, blank=True)
    dtm_modified= models.DateTimeField(null=True, blank=True)
    remarks= models.TextField(max_length=1000,null=True, blank=True)
    dev_remarks= models.TextField(max_length=1000,null=True, blank=True)

    class Meta:
        unique_together = ('test_name', 'college_id', 'department_id', 'year')

    def __str__(self):
        return f"{self.test_name} - {self.college_id} - {self.department_id} - {self.year}"

class comman_announcement(models.Model):
    announcement= models.TextField(max_length=10000,null=True, blank=True)
    announcement_image= models.BinaryField(null=True,blank=True)
    login_id=models.ForeignKey('login',on_delete=models.CASCADE,null=True, blank=True)
    candidate_id=models.ForeignKey('candidate_master',on_delete=models.CASCADE,null=True, blank=True)
    trainer_id=models.ForeignKey('trainer_master',on_delete=models.CASCADE,null=True, blank=True)
    dtm_start= models.DateTimeField(null=True, blank=True)
    dtm_end= models.DateTimeField(null=True, blank=True)
    is_active= models.BooleanField(default=False)
    deleted= models.IntegerField(default=0, null=True, blank=True)
    created_by= models.CharField(max_length=100,null=True, blank=True)
    dtm_created= models.DateTimeField(null=True, blank=True)
    modified_by= models.CharField(max_length=100,null=True, blank=True)
    dtm_modified= models.DateTimeField(null=True, blank=True)
    remarks= models.TextField(max_length=1000,null=True, blank=True)
    dev_remarks= models.TextField(max_length=1000,null=True, blank=True)
    class Meta:
        indexes = [
            models.Index(fields=['login_id'], name='comman_login_announce_idx'),
            models.Index(fields=['candidate_id'], name='comman_can_announce_idx'),
            models.Index(fields=['trainer_id'], name='comman_trainer_announce_idx'),
        ]


class invoice_form(models.Model):
    payment_status= models.CharField(max_length=255,null=True, blank=True)
    schedule_date=models.DateTimeField(null=True, blank=True)
    invoice_no= models.CharField(max_length=100,null=True, blank=True,unique=True)
    college_id=models.ForeignKey('college_master',on_delete=models.CASCADE, null=True, blank=True)
    trainer_id=models.ForeignKey('trainer_master',on_delete=models.CASCADE,null=True, blank=True)
    misc_expenses = models.FileField(upload_to='misc_expenses/',null=True, blank=True)
    travel_expenses = models.FileField(upload_to='travel_expenses/',null=True, blank=True)
    food_allowance = models.FileField(upload_to='food_allowance/',null=True, blank=True)
    misc_expenses_type=models.CharField(max_length=255,null=True, blank=True)
    misc_expenses_text = models.TextField(max_length=10000,null=True, blank=True)
    travel_expenses_text = models.TextField(max_length=10000,null=True, blank=True)
    food_allowance_text = models.TextField(max_length=10000,null=True, blank=True)
    dtm_start=models.DateTimeField(null=True, blank=True)
    dtm_end=models.DateTimeField(null=True, blank=True)
    is_tds_deduct=models.BooleanField(default=False)
    overall_feedback= models.TextField(max_length=1000,null=True, blank=True)
    travel_amount= models.CharField(max_length=100,null=True, blank=True)
    print_amount= models.CharField(max_length=100,null=True, blank=True)
    food_amount= models.CharField(max_length=100,null=True, blank=True)
    travel_days= models.CharField(max_length=100,null=True, blank=True)
    print_days= models.CharField(max_length=100,null=True, blank=True)
    food_days= models.CharField(max_length=100,null=True, blank=True)
    training_amount= models.CharField(max_length=100,null=True, blank=True)
    training_days= models.CharField(max_length=100,null=True, blank=True)
    deleted= models.IntegerField(default=0, null=True, blank=True)
    created_by= models.CharField(max_length=100,null=True, blank=True)
    dtm_created= models.DateTimeField(null=True, blank=True)
    modified_by= models.CharField(max_length=100,null=True, blank=True)
    dtm_modified= models.DateTimeField(null=True, blank=True)
    remarks= models.TextField(max_length=1000,null=True, blank=True)
    dev_remarks= models.TextField(max_length=1000,null=True, blank=True)
    class Meta:
        indexes = [
            models.Index(fields=['college_id'], name='idx_invoice_college'),
            models.Index(fields=['trainer_id'], name='idx_invoice_trainer'),
            models.Index(fields=['dtm_start'], name='idx_invoice_dtmstart'),
            models.Index(fields=['dtm_end'], name='idx_invoice_dtmend'),
            models.Index(fields=['schedule_date'], name='idx_invoice_scheduledate'),
            models.Index(fields=['payment_status'], name='idx_invoice_paymentstatus'),
        ]


class job_offers(models.Model):
    company_name=models.CharField(max_length=1000,null=True, blank=True)
    company_profile=models.TextField(max_length=10000,null=True, blank=True)
    post_name = models.CharField(max_length=1000,null=True, blank=True)
    post_name_description = models.CharField(max_length=1000,null=True, blank=True)
    announcement= models.TextField(max_length=10000,null=True, blank=True)
    announcement_image= models.BinaryField(null=True,blank=True)
    intern_fulltime= models.CharField(max_length=1000,null=True, blank=True)
    job_type=models.CharField(max_length=1000,null=True, blank=True)
    on_off_campus= models.BooleanField(default=False)
    college_id=models.ManyToManyField('college_master', blank=True)
    department_id=models.ManyToManyField('department_master', blank=True)
    skill_id = models.ManyToManyField('skills_master', blank=True)
    cgpa= models.CharField(max_length=255,null=True, blank=True)
    marks_10th= models.CharField(max_length=255,null=True, blank=True)
    marks_12th= models.CharField(max_length=255,null=True, blank=True)
    gender= models.CharField(max_length=1000,null=True, blank=True)
    history_of_arrears= models.CharField(max_length=1000,null=True, blank=True)
    standing_arrears= models.IntegerField(null=True, blank=True)
    interview_date=models.DateTimeField(null=True, blank=True)
    year=models.CharField(max_length=50,null=True, blank=True) 
    location= models.TextField(max_length=5000,null=True, blank=True)
    no_of_offers=models.IntegerField(null=True, blank=True)
    packages=models.CharField(max_length=255,null=True, blank=True)
    deleted= models.IntegerField(default=0)
    created_by= models.CharField(max_length=100,null=True, blank=True)
    dtm_created= models.DateTimeField(null=True, blank=True)
    modified_by= models.CharField(max_length=100,null=True, blank=True)
    dtm_modified= models.DateTimeField(null=True, blank=True)
    remarks= models.TextField(max_length=1000,null=True, blank=True)
    dev_remarks= models.TextField(max_length=1000,null=True, blank=True)
    class Meta:
        indexes = [
            models.Index(fields=[ 'company_name'], name='idx_company_year'),
            models.Index(fields=['interview_date'], name='idx_interview_date'),
        ]

class company_login(models.Model):
    company_name=models.CharField(max_length=1000,null=True, blank=True)
    company_profile=models.TextField(max_length=10000,null=True, blank=True)
    company_logo= models.BinaryField(null=True,blank=True)
    user_name=models.CharField(max_length=1000,null=True, blank=True)
    email_id=models.EmailField(null=True, blank=True)
    mobile_no=models.CharField(max_length=1000,null=True, blank=True)
    password=models.CharField(max_length=1000,null=True, blank=True)
    college_id=models.ManyToManyField('college_master', blank=True)
    deleted= models.IntegerField(default=0)
    created_by= models.CharField(max_length=100,null=True, blank=True)
    dtm_created= models.DateTimeField(null=True, blank=True)
    modified_by= models.CharField(max_length=100,null=True, blank=True)
    dtm_modified= models.DateTimeField(null=True, blank=True)
    remarks= models.TextField(max_length=1000,null=True, blank=True)
    dev_remarks= models.TextField(max_length=1000,null=True, blank=True)
    class Meta:
        indexes = [
            models.Index(fields=['email_id'], name='idx_email'),
            models.Index(fields=['user_name'], name='idx_user'),
            models.Index(fields=[ 'deleted'], name='idx_email_deleted'),
        ]

class training_schedule(models.Model):
    training_id = models.ForeignKey('training_schedule_temp', on_delete=models.CASCADE, null=True, blank=True)
    college_id = models.ForeignKey('college_master', on_delete=models.CASCADE, null=True, blank=True)
    topic_id = models.ForeignKey('content_master', on_delete=models.CASCADE, null=True, blank=True)
    skill_type_id=models.ForeignKey('skill_type',on_delete=models.CASCADE,null=True, blank=True)
    question_type_id=models.ForeignKey('question_type',on_delete=models.CASCADE,null=True, blank=True)
    batch_no = models.CharField(max_length=100, null=True, blank=True)
    trainer_id = models.ForeignKey('trainer_master', on_delete=models.CASCADE, null=True, blank=True)
    dtm_start_trainer = models.DateTimeField(null=True, blank=True)
    dtm_end_trainer = models.DateTimeField(null=True, blank=True)
    dtm_of_training = models.DateTimeField(null=True, blank=True)
    dtm_start_student = models.DateTimeField(null=True, blank=True)
    dtm_end_student = models.DateTimeField(null=True, blank=True)
    student_ids= models.JSONField(default=list, null=True, blank=True)
    status= models.TextField(max_length=1000,null=True, blank=True)
    session=models.CharField(max_length=100, null=True, blank=True)
    deleted = models.IntegerField(default=0)
    created_by = models.CharField(max_length=100, null=True, blank=True)
    dtm_created = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'training_schedule'
        indexes = [
            models.Index(fields=['college_id'], name='idx_ts_college'),
            models.Index(fields=['topic_id'], name='idx_ts_topic'),
            models.Index(fields=['trainer_id'], name='idx_ts_trainer'),
            models.Index(fields=['batch_no'], name='idx_ts_batch'),
            models.Index(fields=['deleted'], name='idx_ts_deleted'),
            models.Index(fields=['training_id'], name='idx_ts_training_id'),  # ✅ newly added FK index
            models.Index(fields=['dtm_of_training'], name='idx_ts_dtm_of_training'),
        ]

class training_schedule_temp(models.Model):
    college_id=models.ForeignKey('college_master',on_delete=models.CASCADE, null=True, blank=True)
    trainer_date=models.JSONField(default=dict, null=True, blank=True)
    question_type=models.JSONField(default=list, null=True, blank=True)
    skill_type=models.JSONField(default=list, null=True, blank=True)  
    batch_skill=models.JSONField(default=list, null=True, blank=True) 
    no_of_days=models.IntegerField(default=0, null=True, blank=True)
    topics = models.JSONField(default=list, null=True, blank=True)
    no_of_topics=models.IntegerField(default=0, null=True, blank=True)
    location=models.CharField(max_length=100,null=True, blank=True)
    batches=models.JSONField(default=list, null=True, blank=True)
    trainers=models.JSONField(default=list, null=True, blank=True)  
    no_of_trainer=models.IntegerField(default=0, null=True, blank=True)
    no_of_batch=models.IntegerField(default=0, null=True, blank=True)
    department_id=models.TextField(max_length=10000, null=True, blank=True)
    year=models.TextField(max_length=10000, null=True, blank=True)
    trainer_ids=models.CharField(max_length=100,null=True, blank=True)
    data_extract= models.JSONField(default=dict, null=True, blank=True)
    training_name=models.CharField(max_length=100,null=True, blank=True)
    deleted = models.IntegerField(default=0)
    
    class Meta:
        db_table = 'training_schedule_temp'
        indexes = [
            models.Index(fields=['college_id'], name='idx_tst_college'),
            models.Index(fields=['training_name'], name='idx_tst_training_name'),
            models.Index(fields=['location'], name='idx_tst_location'),
        ]

class employee_db(models.Model):
    name = models.CharField(max_length=255, db_index=True,null=True, blank=True)
    emp_id = models.CharField(max_length=50, unique=True,null=True, blank=True)
    designation = models.CharField(max_length=100,null=True, blank=True)
    location = models.CharField(max_length=100, db_index=True,null=True, blank=True)
    mobile_no = models.CharField(max_length=15,null=True, blank=True)
    email_id=models.EmailField(null=True, blank=True)
    user_name=models.CharField(max_length=1000,unique=True, null=True, blank=True)
    deleted = models.IntegerField(default=0,null=True, blank=True)
    created_by = models.CharField(max_length=100, null=True, blank=True)
    dtm_created = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.name} ({self.emp_id})"

    class Meta:
        indexes = [
            models.Index(fields=['name'], name='idx_employee_name'),
            models.Index(fields=['location'], name='idx_employee_location'),
            models.Index(fields=['deleted'], name='idx_employee_deleted'),
        ]

class employee_test_assign(models.Model):
    employee_id = models.ForeignKey('employee_db', on_delete=models.CASCADE, null=True, blank=True)
    test_name = models.CharField(max_length=100,null=True, blank=True)
    test_type = models.CharField(max_length=100,null=True, blank=True)
    question_id=models.ForeignKey('question_paper_master',on_delete=models.CASCADE, null=True, blank=True)
    question_ids=models.JSONField(default=list, null=True, blank=True)
    is_active= models.BooleanField(default=False)
    test_date = models.DateField(null=True, blank=True)
    test_status = models.CharField(max_length=50, choices=[('assigned', 'Assigned'), ('completed', 'Completed')], default='assigned')
    total_score = models.IntegerField(null=True, blank=True)
    avg_mark = models.IntegerField(null=True, blank=True)
    assign_count= models.IntegerField(null=True, blank=True)
    remarks = models.TextField(null=True, blank=True)
    deleted = models.IntegerField(default=0)
    created_by = models.CharField(max_length=100, null=True, blank=True)
    dtm_created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.employee.name} - {self.test_name}"

    class Meta:
        indexes = [
            models.Index(fields=['test_name'], name='idx_test_name'),
            models.Index(fields=['test_status'], name='idx_test_status'),
            models.Index(fields=['deleted'], name='idx_test_deleted'),
        ]

class tests_emp_answer(models.Model):
    emp_id=models.ForeignKey('employee_db',on_delete=models.CASCADE,null=True, blank=True)
    test_name=models.CharField(max_length=1000,null=True, blank=True)
    answer= models.TextField(max_length=30000,null=True, blank=True)
    result= models.IntegerField(null=True, blank=True)
    question_id= models.ForeignKey('question_master', on_delete=models.CASCADE, null=True, blank=True)

class folder_master(models.Model):
    skill_type_id=models.ForeignKey('skill_type',on_delete=models.CASCADE, null=True, blank=True)
    folder_name=models.CharField(max_length=1000,null=True, blank=True)
    deleted = models.IntegerField(default=0)
    created_by = models.CharField(max_length=100, null=True, blank=True)
    dtm_created = models.DateTimeField(null=True, blank=True)
    folder_logo= models.BinaryField(null=True,blank=True)
    syllabus = models.TextField(null=True, blank=True)

   
class daily_email_log(models.Model):
    college_id = models.IntegerField(null=True, blank=True)
    sent_date = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('college_id', 'sent_date')

