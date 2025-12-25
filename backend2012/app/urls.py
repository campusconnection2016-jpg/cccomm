from django.urls import path
from . import views
from django.conf.urls.static import static
from .views import  ExcelImportView_Questions,get_group_test_name_corporate, ExcelImportView_Questions_Code_testcase,ExcelImportView_Questionsphysico, ExcelImportView_Questions_Code, ExcelImportView_Candidateuser, ExcelImportView_CandidateLAST
from django.views.decorators.csrf import csrf_exempt
from .views import import_questions_from_word,ExcelImportView_EmployeeDB,update_test_candidates_status_reassign,import_questions,import_questions_from_word_place, ExcelImportView_Questions_place, ExcelImportView_Questions_Code_place, import_questions_place,ExcelImportView_Questions_Code_Placetestcase
from django.conf import settings
from .views import update_training_schedule
urlpatterns = [
     path('api/get/login/roles/', views.get_login_roles, name='login-retrive'),
   
    path('api/get/login/', views.get_login, name='login-retrive'),
    path('api/add/login/', views.login_create.as_view(), name='login-create'),
    path('api/update/login/<str:user_name>/', views.update_login, name='login-update'),
    path('api/update/login/Password/<str:user_name>/', views.update_login_password.as_view(), name='login-update_passowrd'),
    path('api/login/pass/', views.get_login_data, name='get_login_data'),
    path('api/delete/login/<int:pk>/', views.delete_login, name='login-delete'),
    path('api/login/datas/', views.get_login_update, name='get_login_data'),
  
    path('api/skilltypes/', views.skilltypegetAPIView.as_view(), name='skilltype-list'),
    path('api/skilltypes/create/', views.skilltypecreateAPIView.as_view(), name='skilltype-create'),
    path('api/skilltypes/<int:pk>/', views.skilltypeRetrieveUpdateDestroyAPIView.as_view(), name='skilltype-detail'),
    path('api/skilltypes/<int:pk>/delete/', views.delete_skill_type, name='delete-skilltype'),

    path('api/testtypes/', views.test_type_listView.as_view(), name='testtypes-list'),
    path('api/testtypes/create/', views.test_type_create.as_view(), name='testtypes-create'),
    path('api/testtypes/<int:pk>/', views.test_type_Update.as_view(), name='testtypes-detail'),
    path('api/testtypes/<int:pk>/delete/', views.delete_test_type, name='delete-testtypes'),

    path('api/questiontypes/', views.question_type_listView.as_view(), name='questiontypes-list'),
    path('api/questiontypes/create/', views.question_type_create.as_view(), name='questiontypes-create'),
    path('api/questiontypes/<int:pk>/', views.question_type_Update.as_view(), name='questiontypes-detail'),
    path('api/questiontypes/<int:pk>/delete/', views.delete_question_type, name='delete-questiontypes'),
 path('api/questions_io/', views.get_questions_IO, name='questions-list'),

     path('api/colleges/delete/<int:pk>/', views.delete_college, name='college-delete'),
 path('api/colleges/', views.CollegeListView, name='college-list'),
    # Department URLs
    path('api/departments/', views.DepartmentListView, name='department-list'),
   path('api/departments/create/', views.departmentCreateView.as_view(), name='department-create'),
    path('api/departments/update/<int:pk>/', views.departmentUpdateView.as_view(), name='department-update'),
    path('api/departments/delete/<int:pk>/', views.delete_department, name='department-delete'),

    path('api/skills/', views.skillsAPIView.as_view(), name='skill-list'),
    path('api/skills/create/', views.skillscreateAPIView.as_view(), name='skill-create'),
    path('api/skills/<int:pk>/', views.skillsRetrieveUpdateAPIView.as_view(), name='skill-detail'),
    path('api/skills/<int:pk>/delete/', views.delete_skills, name='delete-skill'),
 
    path('api/candidates/', views.get_candidate, name='candidates-list'),
    path('api/candidates/all/', views.get_candidate_all, name='candidates-list-all'),
    path('api/candidates/create/old/', views.candidatescreateAPIView.as_view(), name='candidates-create'),
    path('api/candidates/<int:pk>/', views.candidates_Select_Update.as_view(), name='candidates-detail'),
   # path('api/candidates/<int:pk>/delete/', views.delete_candidates, name='delete-candidates'),
    path('api/candidates/delete/', views.delete_candidates, name='delete_candidates'),
    path('api/content/', views.get_content, name='content-list'),

    path('api/content/create/', views.contentcreateAPIView.as_view(), name='content-create'),
    path('api/content/<int:pk>/', views.contentUpdateAPIView.as_view(), name='content-detail'),
    path('api/content/<int:pk>/delete/', views.delete_content, name='delete-content'),

    # path('api/trainers/', views.TrainerListAPIView.as_view(), name='trainer-list'),
    path('api/trainers/all/', views.get_trainer_all, name='candidates-list-all'),
    path('api/trainers/create/', views.TrainerCreateAPIView.as_view(), name='trainer-create'),
    path('api/trainers/<int:pk>/', views.TrainerRetrieveUpdateAPIView.as_view(), name='trainer-detail'),
    path('api/trainers/<int:pk>/delete/', views.delete_trainer, name='delete-trainer'),
    path('api/trainer/<str:userName>/', views.get_trainer_by_userName, name='trainer'), 
   
    path('api/tests/get/', views.get_test, name='tests-list'),
    # path('api/tests/delete/<int:pk>/', views.testsRetrievedeleteAPIView.as_view(), name='tests-delete'),
    path('api/tests/create/', views.testcreateAPIView.as_view(), name='tests-create'),
    path('api/tests/<int:pk>/', views.testsRetrieveUpdateAPIView.as_view(), name='tests-detail'),
    path('api/tests/<int:pk>/delete/', views.delete_tests, name='delete-tests'),
   
    path('api/testcandidate/', views.get_tests_candidates_map, name='tests-candidates-map-list'),
    path('api/testcandidate/update/', views.testcandidatemapUpdateAPIView.as_view(), name='tests-candidates-map-detail'),
    path('api/testcandidate/update/test_master/', views.test_master_UpdateAPIView.as_view(), name='test_master_UpdateAPIView'),

    path('api/testcandidate/<str:test_name>/delete/', views.delete_testcandidatemap, name='delete-tests-candidates-map'),
    path('api/testcandidate/<int:pk>/updateIsActive/', views.update_testcandidatemap_is_active, name='update-isactive-tests-candidates-map'),
    path('api/testcandidate/<int:student_id_value>/updatedDatabase/', views.update_testcandidatemap_status_login, name='update-isactive-tests-candidates-map'),
    path('api/testcandidate/<int:pk>/submitted/', views.update_testcandidatemap_status_submit, name='update-isactive-tests-candidates-map'),
    path('api/testcandidate/<int:pk>/teststarted/', views.update_testcandidatemap_status_start_test, name='update-isactive-tests-candidates-map'),
    path('api/delete-student-answers/<int:student_id>/', views.delete_student_answers, name='delete-student-answers'),
    path('api/tests-candidates-answers/data/', views.get_tests_candidates_answer, name='tests-candidates-answers-list'),
    path('api/tests-candidates-answers/create/', views.testcandidateanscreateAPIView.as_view(), name='tests-candidates-answers-create'),
    path('api/tests-answer/', views.test_candidates_answer_view, name='test_candidates_answer_view'),
    path('api/tests-answer/submit/', views.test_candidates_answer_view_Submit, name='test_candidates_answer_view-submit'),    
    path('api/tests-candidates-answers/<int:pk>/', views.testcandidateansUpdateAPIView.as_view(), name='tests-candidates-answers-detail'),
    path('api/tests-candidates-answers/<int:pk>/delete/', views.delete_testcandidateanswer, name='delete-tests-candidates-answers'),
    
    path('api/get/course_contenet_feedback/', views.get_course_content_feedback, name='course_contenet_feedback-retrive'),
    path('api/add/course_contenet_feedback/', views.add_course_content_feedback.as_view(), name='course_contenet_feedback-create'),
    path('api/update/course_contenet_feedback/<int:pk>/', views.update_course_content_feedback.as_view(), name='course_contenet_feedback-update'),
    path('api/delete/course_contenet_feedback/<int:pk>/', views.delete_course_content_feedback, name='course_contenet_feedback-delete'),
  path('api/trainers/all/reports/', views.get_trainer_all_Reports, name='get_trainer_all_Reports'),
  
   
    path('api/get/course_schedule/', views.get_student_schedule, name='course_schedule-retrive'),
    path('api/add/course_schedule/', views.add_course_schedule.as_view(), name='course_schedule-create'),
    path('api/update/course_schedule/<int:pk>/', views.update_course_schedule.as_view(), name='course_schedule-update'),
    path('api/delete/course_schedule/<int:pk>/', views.delete_course_schedule, name='course_schedule-delete'),
   
    path('api/question/import_excel/', ExcelImportView_Questions.as_view(), name='excel-import'),
   
    path('api/Candidate/import_excel/', ExcelImportView_CandidateLAST.as_view(), name='excel-import-Candidate'),
    path('api/question/import_excel/code/', ExcelImportView_Questions_Code.as_view(), name='excel-import'),
    path('api/college/Candidate/import_excel/', views.ExcelImportView_CandidateLASTCollege.as_view(), name='excel-import-Candidate'),
   
    path('api/rules/', views.rules_listView.as_view(), name='rules-list'),
    path('api/rules/create/', views.rules_create.as_view(), name='rules-create'),
    path('api/rules/<int:pk>/', views.rules_Update.as_view(), name='rules-detail'),
    path('api/rules/<int:pk>/delete/', views.delete_rules, name='delete-rules'),
    
    path('api/update/totalScore/<int:pk>/', views.update_totalScore_test_candidate_map, name='total-score-update'),
    path('api/update/avgMark/<int:pk>/', views.update_Avg_Marks_test_candidate_map, name='avg-mark-update'),
  path('api/test-candidates-map/non-db/create/', views.NonDbTestAssign.as_view(), name='NonDbTestAssign'),
    
    path('api/batch_list/', views.batch_list, name='batch_list'),
    path('api/question_name_list/', views.question_name_list, name='question_name_list'),
    path('api/unique_test_type/', views.unique_test_type, name='unique_test_type'),
    path('api/MCQ_test_type/', views.MCQ_test_type, name='MCQ_test_type'),
    path('api/Coding_test_type/', views.Coding_test_type, name='Coding_test_type'),
    path('api/unique_question_type/', views.unique_question_type, name='unique_question_type'),
     path('api/topic_list/', views.topic_list, name='topic_list'),

    path('api/candidates/text/update/<int:pk>/', views.candidates_one_Update.as_view(), name='candidates-detail'),

    path('api/get-question-paper/', views.get_question_paper, name='get_question_paper'),
    path('api/create-question-paper/', views.questionpapercreateAPIView.as_view(), name='create_question_paper'),
    path('api/update-question-paperss/<int:pk>/', views.questionpaperUpdateAPIView.as_view(), name='update_question_paper'),
    path('api/delete-question-paper/<int:pk>/', views.delete_question_paper, name='delete_question_paper'),

    path('api/get_last_question_paper/', views.get_last_added_question_paper, name='get_last_question_paper'),
    
   
    path('api/questions_io/create/', csrf_exempt(views.upload_question), name='questions-create'),
    path('api/questions_io/<int:pk>/', views.update_question_OLD, name='questions-detail'),
    path('api/questions_io/<int:pk>/delete/', views.delete_question_IO, name='delete-questions'), 

    path('api/questions_Code/', views.get_questions_Code, name='questions-list'),
    path('api/questions_Code/create/', views.upload_question_code, name='questions-create'),
    path('api/questions/<int:question_id>/update/', views.update_question_code, name='update_question_code'),
    # path('api/questions_Code/<int:question_id>/update/', views.update_question, name='update_question'),

    path('api/questions_all/<int:question_name_id>/', views.get_questions_Qp_id, name='get_questions_Qp_id'),
    path('api/Candidate/user/import_excel/', ExcelImportView_Candidateuser.as_view(), name='excel-import-Candidate'),
    path('api/college/user/import_excel/', views.ExcelImportView_CandidateuserCollege.as_view(), name='excel-import-Candidate'),

    path('api/questions_io/create/code/', views.questionscreateAPIView_IO_code.as_view(), name='questions-create-old'),
    path('api/questions_io/<int:pk>/code/', views.questionsRetrieveUpdateAPIView_IO_code.as_view(), name='questions-detail'),
    path('api/test-update/', views.get_tests_candidates_map_Update_ID, name='get_tests_candidates_map_Update_ID'),
    
    path('api/update/need-info/<int:studentID>/', views.update_Need_Candidate_info, name='update_Need_Candidate_info'),
    path('api/update/clg_login/<str:userName>/', views.update_clg_login, name='update_clg_login'),

    path('api/get_candidate_login/', views.get_candidate_login , name='get_candidate_login'),
    
    path('api/test-assign/selected/', views.TestAssignFor_Selected.as_view() , name='TestAssignFor_Selected'),

 
    path('api/test_reports/', views.get_tests_Reports , name='get_tests_reports'),
    
    path('api/company/', views.company_listView.as_view(), name='company_master_list'),
    path('api/company/create/', views.company_create.as_view(), name='company_master_create'),
    path('api/company/<int:pk>/', views.company_master_Update.as_view(), name='company_master_update'),
    path('api/company/<int:pk>/delete/', views.company_master_delete.as_view(), name='company_master_update'),
    path('api/company/delete/<int:pk>/', views.delete_company_master, name='delete_company_master'),
    # Job Master URLs
    path('api/job/', views.get_job, name='get_job'),
    path('api/job/update/<int:pk>/', views.jobUpdateAPIView.as_view(), name='job_update'),
   # path('api/job/<int:pk>/', views.jobUpdateAPIView.as_view(), name='job_update'),
    path('api/job/delete/<int:pk>/', views.delete_job, name='delete_job'),
  
   path('api/job/create/New/', views.jobcreateAPIViewNew.as_view(), name='job_create'),

    #------------------Placement admin Dashboard------------------------#

    path('api/distinct-test-name-count-today/', views.get_distinct_test_name_count_today, name='get_distinct_test_name_count_today'),
   
    #-----------------Students Dashboards------------------------------------#

    #path('import-questions/', ImportQuestionsView.as_view(), name='import-questions'),
    path('api/import-mcq-questions/', csrf_exempt(import_questions_from_word), name='import_questions'),
    path('api/import-coding-questions/', csrf_exempt(import_questions), name='import_questions'),
   
 
    path('api/trainer-feedback/create/', views.add_trainer_feedback.as_view(), name='add_trainer_feedback'),
    path('api/trainer-feedback/get/', views.get_trainer_feedback, name='get_trainer_feedback'),
    path('api/trainer-feedback/update/<int:pk>/', views.update_trainer_feedback.as_view(), name='update_trainer_feedback'),
    path('api/trainer-feedback/delete/<int:pk>/', views.delete_trainer_feedback, name='delete_trainer_feedback'),
    #----------------------Compiler coding Test----------------------#
    
    path('api/program_compiler/', views.program_compiler, name='program_compiler'),
    
    path('api/tests-answer-com/', views.test_candidates_answer_view_Com, name='test_candidates_answer_view'),
    path('api/tests-answer-com/submit/', views.test_candidates_answer_view_Submit_Com, name='test_candidates_answer_view-submit'),    
     path('api/tests-answer-com/submit-practice/', views.test_candidates_answer_view_Submit_Com_practice, name='test_candidates_answer_view_Submit_Com_practice'),    
   
    #----------------------Training admin dashboard----------------------#

    path('api/distinct-test-name-count/<int:college_id>/', views.get_distinct_test_name_count, name='get_distinct_test_name_count'),    
    path('api/avg-score-by-department/<int:college_id>/<str:dtm_start>/', views.get_avg_score_by_department, name='get_avg_score_by_department'),
    path('api/avg-score-by-department-coding/<int:college_id>/<str:dtm_start>/', views.avg_score_by_department_Coding, name='avg_score_by_department_Coding'),
    path('api/max-score-by-department/<int:college_id>/', views.get_max_score_by_department, name='get_max_score_by_department'),
    path('api/max-score-by-department-coding/<int:college_id>/', views.get_max_score_by_department_coding, name='get_max_score_by_department-coding'),
    path('api/count-company-names/', views.count_company_names, name='count_company_names'),
    path('api/candidates/all/<int:college>/', views.get_candidate_all_college_id, name='candidates-list-all'),
    
    #------------------Placement admin Dashboard------------------------#

    path('api/distinct-test-name-count-today/', views.get_distinct_test_name_count_today, name='get_distinct_test_name_count_today'),
    
    #-----------------Students Dashboards------------------------------------#
    path('api/course-progress/<int:student_id>/', views.course_progress, name='course_progress'),
    path('api/tests-by-student/<int:student_id>/', views.get_tests_by_student, name='get_tests_by_student'),
    path('api/avg-total-score-by-month/<int:student_id>/', views.get_avg_total_score_by_month, name='avg_total_score_by_month'),
   # path('api/attendance-stu/<str:reg_no>/', views.attendance_report_new, name='attendance_report'),
   
    #------------- Student Request URLs---------------------------#
    path('api/student_request/', views.get_student_request, name='get_job'),
    path('api/student_request/create/', views.student_request_createAPIView.as_view(), name='job_create'),
    path('api/student_request/<int:pk>/', views.student_request_UpdateAPIView.as_view(), name='job_update'),
    path('api/update/lms/<int:id>/', views.update_LMS_id, name='update_LMS_id'),
    path('api/topic/lms/<int:id>/', views.update_LMS_Topic_id, name='update_LMS_Topic_id'),


    path('api/get-test-type-category/<str:test_name>/', views.get_test_type_category, name='get_test_type_category'),
    path('api/test-candidates/<str:username>/need-info/', views.get_test_candidates_NeedInfo, name='get_test_candidates_NeedInfo'),
  
    #-------------------------student Dasboard New-------------------------------#

    path('api/active-tests-count/<int:student_id>/', views.active_tests_count, name='active-tests-count'),
    path('api/number-of-offers/<int:candidate_id>/', views.get_number_of_offers, name='get-number-of-offers'),
    path('api/student-requests/count/<int:student_id>/', views.count_student_requests, name='count-student-requests'),
    path('api/monthly-avg-total-score/<int:student_id>/apditute/', views.get_monthly_avg_total_score_apditute, name='monthly-avg-total-score'),
    path('api/monthly-avg-total-score/<int:student_id>/softskill/', views.get_monthly_avg_total_score_softskill, name='monthly-avg-total-score'),
    path('api/monthly-avg-total-score/<int:student_id>/technical/', views.get_monthly_avg_total_score_technical, name='monthly-avg-total-score'),
    path('api/monthly-avg-total-score/<int:student_id>/coding/', views.get_monthly_avg_total_score_Coding, name='monthly-avg-total-score'),

    path('api/number-of-offers/<int:college_id>/college_id/', views.get_number_of_offers_college_id, name='get-number-of-offers'),
    path('api/student-requests/count/<int:college_id>/college_id/', views.count_student_requests_college_id, name='count-student-requests'),
   
    #------Student Attendance table------------------------------------------#
    # path('summary/', views.view_attendance_summary, name='view_attendance_summary'),

    path('api/testcandidate/mcq/<str:user_name>/', views.get_tests_candidates_map_MCQ, name='tests-candidates-map-list-mcq'),
    path('api/testcandidate/coding/<str:user_name>/', views.get_tests_candidates_map_Coding, name='tests-candidates-map-list-mcq'),
    
    #--------------------------PLACEMENT------------------------------#


    path('api/tests-reports/<int:college_id>/placement/', views.get_tests_Reports_placement, name='get_tests_reports_placement'),
      path('api/tests-reports-candidates/placement/', views.get_tests_Reports_placement_Candidates, name='get_tests_reports_placement'),
   # path('api/tests-reports-candidates/placement/', views.get_tests_Reports_placement_Candidates, name='get_tests_reports_placement'),

    path('api/students-test-schedule/<str:user_name>/', views.get_students_test_schedule, name='tests-candidates-map-list'),
    
    path('api/questions_io/<int:question_id>/filter/', views.get_questions_IO_filter, name='get_questions_IO_filter'),
    path('api/test-list/<str:test_name>/', views.get_tests_candidates_map_testName, name='tests-candidates-map-list'),
path('api/test-list/<str:test_name>/<int:college_id>/', views.get_tests_candidates_map_testName, name='tests-candidates-map-list-with-college'),

    path('api/course-schedule-map/', views.CourseScheduleMapView.as_view(), name='course-schedule-map'),

    path('api/sub_topic/<str:topic_name>/', views.get_content_master_subTopic, name='content-master'),

    path('api/course-content/students/', views.students_course_content_view, name='course-content'),

    path('api/delete-question-paper/<str:question_paper_name>/', views.delete_question_paper_by_name, name='delete-question-paper-by-name'),

    path('api/course-content/Trainer/', views.Trainer_course_content_view, name='course-content'),
    
    path('api/candidates/username/', views.get_candidate_user_name, name='candidates-list-all'),

    path('api/candidate-info/', views.candidate_info, name='candidate-info'),
    path('api/update-candidate-info/', views.update_candidate_info, name='update-candidate-info'),

    path('api/get-department-info/', views.get_department_info, name='get_department_info'),
    
    path('api/get-department-info/LMS/', views.get_department_info_LMS, name='get_department_info'),

    path('api/get_candidate_details/', views.get_candidate_details, name='get_candidate_details'),

    #--------------College With Logo----------------------------#

    path('api/colleges/list/', views.get_colleges, name='college-list'),
    path('api/colleges/list/clg/', views.get_colleges_clg, name='college-list'),
    path('api/colleges/uploads/', views.upload_college, name='college-upload'),
    path('api/colleges/updates/<int:college_id>/', views.update_college, name='college-update'),
  
    path('api/colleges/deletes/<int:pk>/', views.delete_college, name='college-delete'),
    path('api/eligible-students-list/all/', views.get_eligible_studentsall, name='eligible-student-list'),
    path('api/eligible-students/', views.get_eligible_students, name='get_eligible_students'),
    path('api/eligible-students/count/', views.get_eligible_students_count, name='eligible-student-list'),
    #  path('api/candidates-eligible-list/', views.get_candidate_all_job_master, name='get_candidate_all_job_master'),
    path('api/db-candidates/', views.get_database_candidate, name='get_database_candidate'),
    path('api/nondb-candidates/', views.get_nondb_candidate, name='get_database_candidate'),
    path('api/eligible-student/update/<int:job_id_value>/<str:round_of_interview_value>/', views.update_eligible_student, name='update-eligible-student'),
    path('api/eligible-students/round/', views.get_eligible_students_round, name='get_eligible_students'),
    path('api/update-eligible-student-list/', views.UpdateEligibleStudentListView.as_view(), name='update-eligible-student-list'),
    path('api/update-is-accept/<int:pk>/', views.update_is_accept, name='update-is-accept'),
    path('api/update-is-decline/<int:pk>/', views.update_is_decline, name='update-is-decline'),
    path('api/eligible-registered/count/', views.get_registered_count, name='eligible-student-list'),

# NEW

    path('api/questions_io/<str:test_name>/filter/MCQ/practice/', views.get_questions_IO_filter_mcq_practice, name='get_questions_IO_filter_by_name'),

     path('api/questions_io/<str:test_name>/filter/Code/practice/', views.get_questions_IO_filter_code_practice, name='get_questions_IO_filter'),
  
    path('api/questions_io/<int:question_id>/filter/MCQ/', views.get_questions_IO_filter_mcq, name='get_questions_IO_filter'),
    path('api/questions_io/<int:question_id>/filter/Code/', views.get_questions_IO_filter_code, name='get_questions_IO_filter'),
     
    path('api/tests-answer/filters/', views.get_tests_ansnwers_filter, name='tests-candidates-answers-list'),
    
    path('api/get_total_marks/<int:student_id_value>/<str:test_name_value>/', views.get_total_marks, name='get_total_marks'),

    path('api/question_master/<int:question_id>/update/', views.update_question, name='update_question'),
    
    
    path('api/distinct-dtm-uploads/<int:college_id>/', views.get_distinct_dtm_uploads, name='distinct-dtm-uploads'),
    path('api/distinct-dtm-uploads/cc/', views.get_distinct_dtm_uploads_cc, name='distinct-dtm-uploadscc'),


    path('api/testcandidate/<int:id>/camera/', views.get_tests_candidates_camera, name='tests-candidates-map-list'),

    
    path('api/rounds/eligible-student-count/', views.get_eligible_student_count_rounds, name='eligible-student-count'),

    path('api/total-no-of-offers/<int:college_id>/', views.get_candidate_offers_count, name='distinct-dtm-uploads'),

    path('api/eligible-students/job-rounds/<int:job_id>/<str:round_of_interview>/', views.get_eligible_students_job_id, name='eligible-students'),
    path('api/round-of-interview-count/', views.get_round_of_interview_count, name='round-of-interview-count'),
    path('api/registered-count-by-company/', views.get_registered_count_by_company, name='registered-count-by-company'),  
 
    path('api/job-companies/', views.distinct_job_companies, name='distinct_job_companies'),
    path('api/send-email/<int:job_id_value>/<str:round_of_interview_value>/', views.send_email_to_students, name='send_email_to_students'),
    
    path('api/test-attendance-summary/', views.get_test_attendance_summary, name='test_attendance_summary'),

    path('api/upload-screenshot/<int:pk>/', views.upload_screenshot, name='upload_screenshot'),
    
    path('api/students/announcement/<int:students_id>/', views.get_student_announcement, name='get_student_announcement'),

    path('api/eligible-student-reports/', views.get_eligible_student_Reports, name='eligible_student_reports'),
    path('api/rounds/', views.getRoundOfInterviews_API, name='getRoundOfInterviews_API'),
    path('api/unique-topics-subtopics/', views.get_unique_topics_and_subtopics, name='unique-topics-subtopics'),
    path('api/max-score-by-department/<int:college_id>/placement/', views.get_max_score_by_department_placement, name='get_max_score_by_department'),
    path('api/max-score-by-department-coding/<int:college_id>/placement/', views.get_max_score_by_department_coding_placement, name='get_max_score_by_department-coding'),
    path('api/notification_count/', views.get_notification_count, name='notification_count'),
    path('api/student_request/list/', views.StudentRequestListAPIView.as_view(), name='student_request_list'),
    path('api/student_request/<int:student_id>/update_status/', views.UpdateStatusAPIView.as_view(), name='update_student_request_status'),
    path('api/student_request/<int:student_id>/check_status/', views.CheckStudentRequestStatusAPIView.as_view(), name='check_student_request_status'),

    path('api/candidates/request/', views.get_candidate_request, name='candidates-list'),
    path('api/get-test-type-categories/<str:test_type_value>/', views.get_test_type_categories, name='get_test_type_categories'),

    
    path('api/trainers_report/create/', views.TrainersReportCreateAPIView.as_view(), name='create_trainers_report'),
    
    path('api/trainers_report/Training/create/', views.TrainersReportCreateTrainingAPIView.as_view(), name='create_training_report'),

    # Retrieve, Update, or Delete a specific trainers_report by id
    path('api/trainers_report/<int:pk>/', views.TrainersReportUpdateAPIView.as_view(), name='update_trainer_report'),

    # Custom delete view for marking a trainers_report as deleted
    path('api/trainers_report/delete/<int:pk>/', views.delete_trainers_report, name='delete_trainer_report'),
    path('api/trainers_report/', views.get_trainers_report, name='get_trainers_report'),
    path('api/trainers/<str:user_name>/topics/', views.get_trainer_topics_by_username, name='get_trainer_topics_by_username'),
    path('api/trainer/update/<str:user_names>/', views.update_trainer, name='update-trainer'),
    path('api/add_trainer/user_name/', views.add_trainer_username, name='add_trainer_username'),
    path('api/update-is-edit/<str:user_names>/', views.update_is_edit, name='update_is_edit'),
    path('api/update-is-terms/<str:user_names>/', views.update_is_terms, name='update_is_terms'),
    path('api/get_trainer_status/<str:user_names>/', views.get_trainer_status, name='update_is_terms'),
    path('api/student-requests/accepted/<str:user_name>/', views.GetAcceptedStudentRequests.as_view(), name='accepted-student-requests'),
    path('api/send-whatsapp/job-rounds/<int:job_id>/<str:round_of_interview>/', views.send_whatsapp_to_students, name='send_whatsapp_to_students'),
    path('api/filter-candidates-download/', views.filter_candidates_download, name='filter_candidates_download'),
    path('api/get-skill-type-by-test-name/', views.get_skill_type_by_test_name, name='get_skill_type_by_test_name'),
     path('api/trainers/skills/', views.get_trainer_skills, name='get_trainer_skills'),

    path('api/ccannouncement/add/', views.upload_announcement, name='add_announcement'),
    path('api/ccannouncement/update/<int:announcement_id>/', views.update_announcement, name='update_announcement'),
    path('api/ccannouncement/', views.get_announcements, name='update_announcement'),
    path('api/ccannouncement/delete/<int:pk>/', views.delete_comman_annoucement, name='cc-delete'),
    path('api/Placeannouncement/add/', views.upload_placement_announcement, name='add_announcement'),
    path('api/test-candidate/score/<int:id>/', views.get_total_score, name='get_total_score'),
    path('api/test-reports/', views.get_test_reports, name='test-reports'),
    path('api/distinct-tests/', views.get_distinct_test_data, name='distinct-tests'),
    path('api/test-reports/placement/', views.get_test_reports_placement, name='test-reports-placement'),
    path('api/students-completed-reports/', views.get_completed_reports_cc, name='students-completed-reports'),
    path('api/update-db/', views.Update_Db_Candidates.as_view(), name='Update_Db_Candidates'),
    path('api/upload-and-import/', views.upload_and_import_testreport, name='upload_and_import_candidates'),
    path('api/update-db/Placement/', views.Update_Db_CandidatesPlacement.as_view(), name='Update_Db_CandidatesPlacement'),
    path('api/update-TestReport/', views.update_testreport, name='upload_and_import_candidates'),
    path('api/job-master/count/', views.job_offers_count, name='job_master_count'),
    path('api/registered-students-count/', views.accepted_students_count, name='accepted_students_count'),
    path('api/unique-company-count/<int:college>/', views.get_unique_company_count, name='unique_company_count'),
    path('api/job_offer_count/<int:college>/', views.get_total_job_offers, name='unique_company_count'),
    path('api/aptitude-test-count/', views.get_test_candidates_count_aptitude, name='get_test_candidates_count_aptitude'),
    path('api/technical-test-count/', views.get_test_candidates_count_technical, name='get_test_candidates_count_technical'),
    path('api/request-count/cc/', views.request_count_cc, name='request_count_cc'),
    path('api/avg-score-department-aptitude/cc/', views.get_avg_score_by_department_cc, name='get_avg_score_by_department_cc'),
    path('api/avg-score-department-coding/cc/', views.avg_score_by_department_Coding_cc, name='avg_score_by_department_Coding_cc'),
    path('api/clg-topper-mcq/cc/', views.get_College_topper_mcq_cc, name='get_College_topper_mcq_cc'),
        
    path('api/get-news-update/cc/', views.get_announcements_cc, name='get_announcements_cc'),
    path('api/get_job_offers_announcement/Po/', views.get_job_offers_announcement, name='get_job_offers_announcement'),
   
    path('api/get-offer-chart/cc/', views.get_offer_chart_cc, name='get_offer_chart_cc'),
    path('api/get-upcomming-interview/cc/', views.get_upcomming_interview_cc, name='get_upcomming_interview_cc'),
    path('api/get-offer-status/cc/', views.get_offer_status_cc, name='get_offer_status_cc'),
    path('api/get-distinct-company/cc/', views.get_distinct_companies, name='get_offer_status_cc'),
    path('api/get-company-count/cc/', views.get_company_count_cc, name='get_company_count_cc'),
    path('api/college-reg-students-count/', views.accepted_students_count_by_college, name='accepted_students_count_by_college'), 
    path('api/get-job_offer_count/cc/', views.get_total_job_offers_cc, name='get_total_job_offers_cc'),
    path('api/get-answers/', views.get_test_answers, name='get_test_answers'),
    path('api/student-requests_placement/count/', views.JobRequestCount.as_view(), name='job_request_count'),
    path('api/student-requests/placement/', views.FilteredStudentRequests.as_view(), name='filtered_student_requests'),
    path('api/distinct-tests/place/', views.get_distinct_test_data_place, name='distinct-tests'),
    path('api/update-question-paper/', views.QuestionPaperUpdateView.as_view(), name='update-question-paper'),
    path('api/question_paper_view/<int:id>/', views.get_question_paper_by_id, name='get_question_paper_by_id'),
    path('api/mcq/create/', csrf_exempt(views.add_question_mcq), name='questions-create-mcq'),
    path('api/coding/create/', views.add_questions_code.as_view(), name='questions-create-code'),
    path('api/create-question-paper/placement/', views.questionpapercreateAPIView_place.as_view(), name='create_question_paper'),
    path('api/question/import_excel/placement/', ExcelImportView_Questions_place.as_view(), name='excel-import'),
    path('api/import-mcq-questions/placement/', csrf_exempt(import_questions_from_word_place), name='import_questions'),
    path('api/question/import_excel/code/placement/', ExcelImportView_Questions_Code_place.as_view(), name='excel-import'),
    path('api/import-coding-questions/placement/', csrf_exempt(import_questions_place), name='import_questions'),
    path('api/get-question-paper/placement/', views.get_question_paper_place, name='get_question_paper_place'),
    path('api/testcandidate/update/test_reports/', views.test_reports_update_test_name.as_view(), name='test_reports_update_test_name'),
    path('api/db-candidates/place/', views.get_database_candidate_placement, name='get_database_candidate_placement'),
    path('api/nondb-candidates/place/', views.get_nondb_candidate_placement, name='get_nondb_candidate_placement'),
    #path('api/trainer/Invoice_form/',views.Trainer_topic_schedule_view, name='topic-date-aggregation'),
    path('api/course-content/Trainer/invoice/', views.Trainer_course_content_view_invoice, name='course-content_invoice'),
    path('api/create-invoice/', views.add_invoice, name='create-invoice'),
 
    # path('api/create-invoice/', views.InvoiceFormCreateView.as_view(), name='create-invoice'),

    #__________________Student_Dashboard__________________________________________________ 
    path('api/aptitude-test-count/stu/', views.get_aptitute_test_stu, name='get_aptitute_test_stu'),
    path('api/technical-test-count/stu/', views.get_technical_test_stu, name='get_technical_test_stu'),
    path('api/offer-counts/stu/', views.get_number_of_offers_stu, name='get_number_of_offers_stu'),
    path('api/aptitute-percentage/stu/', views.get_student_skill_percentage, name='get_student_skill_percentage'),
    path('api/tst-type-cate/stu/', views.get_test_type_categories_stu, name='get_test_type_categories_stu'),
    path('api/technical-percentage/stu/', views.get_technical_test_reports_stu, name='get_technical_test_reports_stu'),
    path('api/test-schedules/stu/', views.get_upcoming_tests_schedules, name='get_upcoming_tests_schedules'),
    path('api/training-schedules/stu/', views.course_schedule_list_view_stu, name='course_schedule_list_view_stu'),
    path('api/news-updates/stu/', views.stu_news_updates, name='stu_news_updates'),
    path('api/topic-status/stu/', views.get_student_course_details, name='get_student_course_details'),
    
    #----------08-10-2024 (Trainer Dashboard)

    path('api/course-content/Trainer/TrainingSchedule/', views.Trainer_course_content_view_TrainingSchedule, name='course-content_TrainingSchedule'),
    path('api/course-content/Trainer/TestSchedule/', views.Trainer_course_content_view_TestSchedule, name='course-content_testSchedule'),
    path('api/course-content/Trainer/status/', views.Trainer_course_content_view_status, name='course-content_status'),
    path('api/course-content/Trainer/Test_app/', views.Trainer_course_content_view_Test_aptitude, name='course-content_testSchedule_app'),
    path('api/course-content/Trainer/Test_Tech/', views.Trainer_course_content_view_Test_Tech, name='course-content_testSchedule_Tech'),
    path('api/Trainers/Tests_reports/', views.Trainer_Test_reports_data, name='Trainer_Test_reports_data'),
    path('api/Trainers/feedback_reports/', views.Trainer_feedback_count_view, name='Trainer_feedback_count_view'),
    path('api/download/resume/<int:trainer_id>/', views.download_resume, name='download_resume'),
    #-------------Attendance (Students)

       path('api/college_name/trainer/', views.trainer_college_name, name='trainer_college_name'),
    path('api/news-updates/trainer/', views.trainer_news_updates, name='trainer_news_updates'),
    path('api/job-offers/create/', views.create_job_offer, name='job-offer-create'),
    path('api/job-offers/display/', views.get_job_offers, name='job-offer'),
    path('api/invoice-data-display/', views.get_invoice_form, name='get_invoice_form'),
    path('api/update-payment-status/', views.update_payment_status, name='update_payment_status'),
    path('api/announcement/job_offer/', views.job_offer_update_announcement, name='job_offer_update_announcement'),
    path('api/email_sending/job_offer/', views.send_email_to_Placement, name='send_email_to_Placement'),
    path('api/test-keypress/<int:pk>/update/', views.TestCandidateMapUpdateViewKeys.as_view(), name='test-candidate-map-update'),
    path('api/update/capture_duration/', views.update_capture_durations, name='update_test_candidate_map'),
   
    path('api/update-schedule-date/<int:id>/', views.UpdateScheduleDateView.as_view(), name='update-schedule-date'),
  
    path('api/latest-job-offer/', views.get_latest_job_offer, name='latest_job_offer'),
    path('api/job_type/it/', views.job_type_count, name='job_type_count'),
    path('api/job_type/core/', views.job_type_count_core, name='job_type_count_core'),
    path('api/username/check/', views.check_username_exists, name='check_username_exists'),
    path('api/announcements/get/', views.get_distinct_announcements, name='get_distinct_announcements'),
    path('api/announcements/update/', views.update_comman_announcement, name='update_comman_announcement'),
    path('api/announcements/delete/', views.delete_comman_announcement, name='delete_comman_announcement'),
    
    path('api/job_offers/unique/place/', views.get_unique_job_offers, name='get_unique_job_offers'),
   
    path('api/trainer/popup/get/', views.trainer_popup_getting, name='get_popup'),
    path('api/trainer/popup/update/', views.update_trainer_popup, name='update_popup'),
    #______________________________selvi changes_______________________$#

    path('api/test-candidates-map/create/', views.TestAssignviewBatch.as_view(), name='test-candidates-map'),
  

    path('api/update-company-email/', views.UpdateCompanyEmailView.as_view(), name='update-company-email'),

    path('api/get-company-email/', views.GetCompanyEmailView.as_view(), name='get-company-email'),
    path('api/test-reports/PlacementOfficer/', views.get_test_reports_placementofficer, name='test-reports'),
    path('api/update-test-round/', views.UpdateTestRoundView.as_view(), name='update-test-round'),
 
    path('api/nondb/excel/update/', views.ExcelUpdateView_Candidateuser.as_view(), name='update_candidate_users'),
    path('api/nondb/excel/update/Placement/', views.ExcelupdateImport_userCollege.as_view(), name='update_candidate_users'),
 
    path('api/college_group/', views.get_college_group_by_college, name='get_college_group_by_college'),
    path('api/batches/', views.get_candidate_batches, name='get_candidate_batches'),
    path('api/get-department-info/test/', views.get_department_info_test, name='get_department_info_test'),
   
    path('api/distinct-dtm-uploads/test/', views.get_distinct_dtm_uploads_test, name='distinct-dtm-uploads'),
    path('api/candidates/report/', views.get_candidates_testReports, name='distinct-dtm-uploads'),
    path('api/candidates/overall/report/', views.get_candidateoverall_testReports, name='distinct-dtm-uploads'),
    path('api/stu_all/report/', views.get_all_testReports, name='distinct-dtm-uploads'),
    path('api/unique-students/', views.get_unique_students, name='unique_students'),
   
    path('api/add-company-login/', views.add_company, name='add_company'),
    path('api/company/update/<int:company_id>/', views.update_company, name='update_company'),
    path('api/corporate/list/', views.get_companies, name='college-list'),
    path('api/corporate/delete/<int:pk>/', views.delete_corporate, name='delete_corporate'),
    # path('api/tests-schedules/<str:college_id>/corporate/', views.get_group_test_name_corporate, name='get_group_test_name_placement'),
    path('api/tests-schedules/corporate/<str:college_ids>/', get_group_test_name_corporate, name='get_group_test_name_corporate'),
  
    path('api/tests-reports-candidates/<str:college_ids>/<str:test_name>/corporate/', views.get_tests_Reports_corporate_Candidates, name='get_tests_reports_corporate'),
    path('api/corporate_cand/all/<str:college>/', views.get_candidate_all_corporate_id, name='candidates-list-all'),
    path('api/tests-reports-candidates/<str:college_id>/<str:test_name>/corporate/', views.get_tests_Reports_corporate_Candidates, name='get_tests_reports_placement'),
    path('api/ids_college/<str:college_ids>/corporate/', views.CollegeListViewTesTId.as_view(), name='college-list'),
    path('api/jobsIds/<int:id>/', views.get_jobId, name='get_jobs'),

    path('api/batches/cor/', views.get_candidate_batches_cor, name='get_candidate_batches_cor'),
    path('api/question/import_excel/cor/', views.ExcelImportView_Questions_COR.as_view(), name='excel-import'),
    path('api/get-folder-name/', views.getting_folder_name, name='get-folder-name'),
    path('api/get-questions-by-folder/', views.get_questions_by_folder, name='get_questions_by_folder'),
    
    path('api/trainers-usernames/', views.get_non_null_trainers_usernames, name='get_non_null_trainers_usernames'),
   
    path('api/test-candidates-map/corporate/create/', views.TestAssignviewcorporateBatch.as_view(), name='test-candidates-map'),
    path('api/question/import_excel/cor/code/', views.ExcelImportView_Questions_COR_CODE.as_view(), name='excel-import'),

    # API 1: Candidate Details
    path('api/candidate-details/', views.candidate_details, name='candidate-details'),

    # API 2: Test and Score Details
    path('api/test-details/', views.test_details, name='test-details'),
    path('api/test-results/score/', views.get_test_results_score, name='get_test_results_score'),

    path('api/test-question-details/', views.get_test_question_details, name='get_test_question_details'),
    path('api/get-skill-type/', views.get_skill_type, name='get_skill_type'),
    path('api/students-completed-reports/corporate/', views.get_completed_reports_corporate, name='students-completed-reports'),

    #-------------------------------20-12-2024---------------------------------#

    path('api/trainer_report/popup/', views.Trainer_course_content_viewpopup, name='test-candidates-map'),
    path('api/get-invoice/', views.get_invoice_details, name='get_invoice_details'),
    path('api/update-invoice/', views.update_invoice, name='update-invoice'),
    path('api/get-invoice_schedule/', views.get_invoice_with_schedule, name='update-invoice'),
    path('api/delete_invoice/<int:pk>/', views.delete_invoice_form, name='delete-invoice'),
    path('api/update-ccinvoice/', views.update_ccinvoice, name='update_invoice'),
 
    path('api/is_edit/', views.get_is_edit, name='get_is_edit'),
    path('api/get-college-ids/company/', views.get_college_ids_from_company, name='get_college_ids'),
    path('api/distinct-tests/cor/', views.get_distinct_test_data_cor, name='distinct-tests'),
    
    
    path('api/get/login/username/', views.get_login_by_username, name='login-retrive-by-username'),


    path('api/active-tests-by-department/', views.get_active_tests_by_department, name='active-tests-by-department'),
    path('api/active-tests-by-batch-no/', views.get_batch_wise_data, name='get_batch_wise_data'),
    path('api/active-tests-by-username/', views.get_tests_by_username, name='get_tests_by_username'),


    path('api/get_batch_by_college_id/', views.get_batch_by_college_id, name='get_batch_by_college_id'),

    path('api/update-test-status/', views.update_test_status, name='update_test_status'),
    path('api/active-test-name/<str:test_name>/', views.get_active_test_reassign , name='get_tests_Reports_candidates'),
  
    path('api/batches-nondb/', views.get_candidate_batches_non_db, name='get_candidate_batches'),
    
    path('api/get-screenshots/', views.get_screenshots, name='get_screenshots'),
    path('api/departments/id-dept/', views.get_departments, name='get_departments'),
    path('api/test_group/aptitude-test/', views.get_group_test_name_Aptitude_Test , name='get_group_test_name_Aptitude_Test'),
    path('api/test_group/technical-test/', views.get_group_test_name_Technical_Test , name='get_group_test_name_Technical_Test'),
    
    path('api/course-content/Placement/', views.Placement_course_content_view, name='course-content-placement'),
    path('api/get/course_contenet_feedback_count/', views.get_course_content_feedback_count, name='course_contenet_feedback-count'),
    path('api/trainers_report_status/', views.get_trainer_report_status, name='get_trainers_report'), 

    path('api/download-test-reports/', views.get_tests_reports_by_college1, name='download-test-reports'),
    
    path('api/college-master/concat/', views.college_master_list, name='college-master-list'),
    path('api/download-aptitute-percentage/stu/', views.get_student_skill_percentage_download_excel, name='download-test-reports'),
    path('api/sub_topics/', views.get_content_master_subTopic_topic, name='content-master'),
    path('api/update-multiple-test-status/New/', views.update_test_candidates_status, name='update_multiple_test_status'),
    path('api/download/technical-percentage/stu/', views.download_get_technical_test_reports_stu, name='get_technical_test_reports_stu'),
    #path('download/', views.OneDriveDownloadView, name='download_file'),
    path('api/get-news-update/cc/po/', views.get_announcements_cc_po, name='get_announcements_cc'),
    path('api/student-test-summary/', views.get_student_test_summary, name='distinct-dtm-uploads'),
    path('api/test-reports/cor/', views.get_test_reports_cor, name='test-reports'),
    path('api/get_batch_numbers/<int:college_id>/', views.get_batch_numbers, name='get_batch_numbers'),
    path('api/test-candidates-map/create/placement/', views.TestAssignviewBatch_Placement.as_view(), name='test-candidates-map'),
    path('api/get-department-info/test/cumlative/', views.get_department_info_test_cum, name='get_department_info_test'),
    # path('api/update_test_reassign/', views.update_test_candidates_status_reassign, name='update_test_candidates_status_reassign'),
    path('api/update_test_reassign/', update_test_candidates_status_reassign, name="update_test_reassign"),

    path('api/update_question_text/', views.update_question_text, name='update_question_text'),
    path('api/update-test-map-entry/', views.update_test_entries, name='update-test-entry'),
    path('api/get-database-candidate-filter/', views.get_database_candidate_filter, name='get_database_candidate_filter'),
    path('api/get-nondatabase-candidate-filter/', views.get_Nondatabase_candidate_filter, name='get_database_candidate_filter'),
    path('api/batches/clg-id/', views.get_candidate_batches_clg_id, name='get_candidate_batches_clg_id'),
    path('api/batches/clg-id/ndb/', views.get_candidate_batches_clg_id_NDB, name='get_candidate_batches_clg_id'),


    path('api/question/import_excel/po/', views.ExcelImportView_Questions_PO.as_view(), name='excel-import'),
    path('api/question/import_excel/po/code/', views.ExcelImportView_Questions_PO_CODE.as_view(), name='excel-import'),
    path('api/display/job-offer/<int:job_id>/', views.job_offer_view, name='job-offer-detail'),
    path('api/monthwise-test-reports/', views.get_monthly_performance_by_college, name='download-test-reports'),

    path('api/question/import_excel/physico/', ExcelImportView_Questionsphysico.as_view(), name='excel-import'),
   
     path('api/job/<int:pk>/delete/', views.delete_job, name='delete-job'),
    path('api/question/import_excel/code/testcase/', ExcelImportView_Questions_Code_testcase.as_view(), name='excel-import'),
    path('api/question/import_excel/code/placement/testcase/', ExcelImportView_Questions_Code_Placetestcase.as_view(), name='excel-import'),
   

    path('api/get-department-info/test/cc/', views.get_department_info_test_cc, name='get_department_info_test'),
    path('api/test_group/testReport/', views.get_group_test_TestReport , name='get_group_test_name_Aptitude_Test'),
    path('api/grouped-course-schedule/', views.get_grouped_schedule, name='grouped_course_schedule'),
    path('api/get/departments/test-report/', views.get_departments_test_report, name='get_departments_test_report'),
    path('api/get/test-names/test-report/', views.get_test_name_test_report, name='get_test_name_test_report'),
    path('api/get/colleges/test-report/', views.get_colleges_test_report, name='get_colleges_test_report'),
   
    path('api/get_departments/college/', views.get_departments_by_college, name='get_departments_by_college'),
    path('api/get-student-queries/', views.get_student_queries, name='get_student_queries'),
    path('api/department-reports-new/', views.get_group_test_name_DepartmentReports, name='department-reports'),
    path('api/get-test/', views.get_test_by_name, name='get_test_by_name'),
   # path('api/questions_io/<str:test_name>/filter/MCQ/psychometry/', views.get_questions_IO_filter_mcq_psychometry, name='get_questions_IO_filter_mcq_psychometry'),
        path('api/questions_io/<int:question_id>/filter/MCQ/psychometry/', views.get_questions_IO_filter_mcq_psychometry, name='get_questions_IO_filter_mcq_psychometry'),
    
    
    
    path('api/get_year/college/', views.get_YEAR_by_college, name='get_departments_by_college'),

    path('api/grouped-skill-types/', views.get_skill_types_grouped, name='grouped_skill_types'),
   
   path('api/update/totalScore/<int:pk>/psy/', views.update_totalScore_and_avgMark_test_candidate_map, name='total-score-update'),
 path('api/get-department-info/jd/', views.get_department_info_jd, name='get_department_info'),
    path('api/test_group/test-schedules/', views.get_group_test_name , name='get_group_test_name'),
    path('api/test_group/<int:college_id>/test-schedules/', views.get_group_test_name , name='get_group_test_name'),
  

path('api/tests-reports-candidates/po/', views.get_view_results_po, name='get_tests_reports_placement'),

   
    path('api/candidates/mcq/', views.get_candidate_mcq, name='candidates-list'),

  path('api/dept/by/clg/report/po/', views.get_dept_clg_report_po, name='get_dept_clg_report_po'),

    path('api/tests/dept/report/po/', views.get_test_name_dept_report_po, name='get_test_name_dept_report_po'),

    path('api/students/feedback/', views.get_student_feedback_report, name='student_feedback_report'),

path('api/dep-indi-reports/po/', views.get_indi_departmentReport_po, name='get_indi_departmentReport_po'),
 
 #___________________Training________________________#
   path('api/view/Trainingschedule/<int:college_id>/', views.view_college_data, name='view_college_data'),

path('api/training-schedule/new/', views.get_training_schedule_new, name='get_training_schedule'),
  path('api/candidates/batches/<int:college_id>/', views.get_distinct_batches, name='get_distinct_batches'),
path('api/assign-topics/', views.assign_topics_to_trainers, name='assign_topics_to_trainers'),

  path('api/company-test-count/', views.get_test_candidates_count_companyspecific, name='get_test_candidates_count_cmpy'),
    path('api/communication-test-count/', views.get_test_candidates_count_communication, name='get_test_candidates_count_commun'),
  
 path('api/cmpy-test-count/stu/', views.get_cmpy_test_stu, name='get_aptitute_test_cmpy'),
    path('api/commun-test-count/stu/', views.get_commun_test_stu, name='get_technical_test_commun'),
   path('api/colleges/list/Training/', views.get_colleges_clg_training, name='college-list'),
  path('api/college/batches/<int:college_id>/', views.get_batches_by_college_id, name='get_batches_by_college_id'),
   path('api/update-trainer-date/<int:college_id>/', views.update_trainer_date_view, name='update-trainer-date'),
  path('api/question-category-counts/', views.question_category_counts, name='question_category_counts'),
  path('api/question/topic-count/', views.question_topic_counts,name='question_topic_counts'),
path('api/question/subtopic-count/', views.question_subtopic_counts,name='question_subtopic_counts'),
path('api/question/folder-count/', views.question_folder_counts,name='question_folder_counts'),
path('api/question/testtype-count/', views.question_testtype_counts,name='question_test_counts'),

path('api/skill-types/', views.get_skill_types_by_question_type, name='get_skill_types_by_question_type'),
path('api/get_filtered_trainers/', views.get_filtered_trainers,name='get_filtered_trainers'),
  
path('api/schedule_automate/', views.schedule_tests_for_students,name='schedule_tests_for_students'),
path('api/add-training-schedule/', views.add_training_schedule, name='add_training_schedule'),
path('api/update-training-fields/<int:id>/', views.UpdateTrainingScheduleFields.as_view(), name='update-training-fields'),
path('api/add-trainer/login/', views.add_trainer_login, name='add_trainer_login'),
path('api/get-trainers/by_skill/', views.get_trainers_by_skill, name='get_trainers_by_skill'),
 path('api/create-batch/', views.update_batch_for_students,name='create_batch'),
 path('api/get-registration-number-range/', views.get_registration_number_range,name='get_registration_number_range'),
 path('api/departments-by-batch-college/', views.get_departments_by_batch_and_college,name='get_departments_by_batch_and_college'),
 path('api/get-skill-types/', views.get_skill_types_by_question_type,name='get_skill_types_by_question_type'),
 path('api/get-assessment-test-types/', views.get_assessment_test_types,name='get_assessment_test_types'),
 path('api/create-feedback/', views.create_course_content_feedback, name='create_course_content_feedback'),
 path('api/get_student_id/', views.get_student_id_by_username, name='get_student_id_by_username'),
  path('api/update-feedback/<int:pk>/', views.FeedbackUpdateView.as_view(), name='update-feedback'),
path('api/get_training_schedule/<int:training_id>/', views.get_training_schedule_details),
 path('api/get-assigned-topics/<int:training_id>/', views.get_assigned_topics_by_training_id),
 path('api/update-training-schedule/<int:training_id>/', update_training_schedule),
 path('api/get-training-schedule-details/<int:training_id>/', views.get_training_schedule_details),
 path('api/get-training-schedule-temp-data/<int:schedule_id>/', views.get_training_schedule_tempdata),

 #___________________________________________Vishal code____________________________________________________#

path('api/question-paper/grouped/', views.QuestionPaperGroupedAPIView.as_view(), name='question-paper-grouped'),

path('api/test-candidates-map/create/New/', views.TestCandidatesMapBatchCreate.as_view(), name='test-candidates-map-batch-create'),

path('api/colleges-code/', views.CollegecodeListView.as_view(), name='college-list'),

path('api/question-count/', views.QuestionCountByPaperView.as_view(), name='question-count'),

path('api/add/questionupload/New/', views.QuestionUploadAPIView.as_view(), name='add-questionupload'),

path('api/test_master/New/', views.AddTestMasterView.as_view(), name='add-test-master'),

path('api/add/codingquestionupload/', views.CodingQuestionUploadAPIView.as_view(), name='coding-question-upload'),

  path('api/get-practice-test-id/', views.get_practice_test_type_id),

 path('api/get-question-paper-details/', views.get_question_paper_withtestdetails),
path('api/get-question-skill-ids/', views.get_question_and_skill_ids),
path('api/get-difficulty-counts/', views.get_difficulty_level_counts),
 path('api/assign-questions/practicetest/', views.assign_difficulty_questions, name='assign-questions'),
 path('api/testcandidate/mcq/testids/<int:test_candidates_id>/', views.get_tests_candidates_map_by_id, name='tests-candidates-map-list-mcq'),
 path('api/increment-attempt-count/', views.increment_attempt_count, name='increment_attempt_count'),
 path('api/get-question-groups-by-difficulty/', views.get_tests_by_difficulty_and_folder, name='get_question_groups_by_difficulty'),
path('api/grouped-skill-types/folders/', views.get_combined_question_type_skill_folder, name='grouped_skill_types'),
 path('api/student-test-attempts/', views.get_student_test_attempts),
path('api/update-test-status/request/', views.update_test_status_request, name='update_test_status'),

path('api/update-stu-avg-mark/', views.update_student_avg_mark),
path('api/add-trainer/login/new/', views.add_trainer_login_new, name='add_trainer_login'),
path('api/update-trainer-batches/', views.update_trainer_batches),
 path('api/test-candidates/requested/', views.get_requested_test_candidates, name='test-candidates-requested'),
   path('api/test-candidates/re-assigned/', views.reassign_test_candidate, name='test-candidates-requested'),

   path('api/employees/upload/', ExcelImportView_EmployeeDB.as_view(), name='ExcelImportView_EmployeeDB'),
 path('api/assign-test-to-employees/', views.AssignTestToEmployees.as_view(), name='assign_test_to_employees'),

 path('api/employee/answer/create/', views.TestEmployeeAnswerCreateAPIView.as_view(), name='employee-answer-create-update'),
 path('api/employee/answers/display/', views.get_tests_emp_answer, name='get_tests_candidates_answer'),
 path('api/questions_io/<str:test_name>/filter/hdfc_test/', views.get_questions_HDFC_filter_mcq_pre, name='get_questions_HDFC_filter_mcq_pre'),
 path('api/testemp/<int:pk>/IsActive/', views.update_testemp_is_active, name='update-isactive-tests-candidates-map'),
 path('api/update-employee-test-score/', views.UpdateEmployeeTestScoreAPIView.as_view(), name='update_employee_test_score'), 
 path('api/employees/dropdown/', views.get_employee_dropdown, name='get_employee_dropdown'),
 path('api/colleges/test/', views.CollegeListViewTest.as_view(), name='college-list'),
  
  path('api/employees/locations/', views.get_location_dropdown, name='get_location_dropdown'),
  path('api/test-assignment-summary/', views.test_assignment_summary, name='test-assignment-summary'),
  path('api/create-employee/', views.create_employee, name='create-employee'),
 path('api/get/employees/', views.employee_list, name='employee-list'),
  path('api/test-attended-details/', views.get_attended_test_details),
   path('api/upcomming/mcq/emp/<str:user_name>/', views.get_upcomming_MCQ_emp, name='tests-candidates-map-list-mcq'),
	 path('api/employee/update/', views.employee_by_username, name='employee-by-username'),
  path('api/update-selected-students/', views.UpdateEligibleStudentselectedView.as_view(), name='update_selected_students'),
path('api/eligible-students/interview-date/<int:job_id>/', views.get_students_by_job_interview_date, name='eligible_students_interview_date'),
path('api/students/remove_round/', views.RemoveEligibleStudentRoundView, name='remove_students_from_round'),
 path('api/get/topics/by-year/', views.get_topics_by_year, name='get-topics-by-year'),
 path('api/test_group/commun-test/', views.get_group_test_name_commun_Test , name='get_group_test_name_Aptitude_Test'),
    path('api/test_group/company-test/', views.get_group_test_name_company_Test , name='get_group_test_name_Technical_Test'),
   
 path('api/candidates/create/New/', views.CandidatesAndLoginCreateAPIView.as_view(), name='candidates-create'),
  path('api/get_filtered_topics/', views.get_filtered_topics, name='get_filtered_topics'),
 path("api/update_topics/<int:training_id>/", views.update_training_topics, name="update_training_topics"),
path('api/topics/', views.QuestionTypeListAPIView.as_view(), name='topic-list'),
     path('api/folder_master/create/', views.FolderMasterCreateAPIView.as_view(), name='folder-master-create'),
    path('api/folder_master/', views.FolderMasterListAPIView.as_view(), name='folder-master-list'),
path('api/skill_types/<int:topic_id>/', views.SkillTypeListByTopicAPIView.as_view(), name='skill-type-by-topic'),
path('api/folder/<int:pk>/update_name/', views.FolderNameUpdateAPIView.as_view(), name='update-folder-name'),
path('api/folder/<int:pk>/delete/', views.FolderMasterDeleteAPIView.as_view(), name='delete-folder'),

path('api/practice/assign/test', views.PracticeAssignTest, name='practice_assign_test'),
path('api/add/questionupload/New/', views.QuestionUploadAPIView.as_view(), name='add-questionupload'),
path('api/get-tests-by-type-and-difficulty/', views.get_tests_by_type_and_difficulty, name='get_tests_by_type_and_difficulty'),
path('api/candidates/details/', views.CandidateMasterListAPIView.as_view(), name='candidate-list'),
path('api/practice/assign/', views.PracticeAssignAPIView.as_view(), name='practice-assign'),
path('api/questiontypes/Training/', views.question_type_listViewTraining.as_view(), name='questiontypes-list'),
path('api/training_shedule/delete/<int:pk>/', views.delete_training_schedule, name='college-delete'), 
path('api/folder_name/', views.foldergetAPIView.as_view(), name='folder_master-list'),
path('api/folder_name/create/', views.foldercreateAPIView.as_view(), name='folder_master-create'),
path('api/folder_name/<int:pk>/', views.FolderRetrieveUpdateDestroyAPIView.as_view(), name='folder_master-detail'),
path('api/folder_name/<int:pk>/delete/', views.delete_folder_master, name='delete-folder_masters'),
 path('api/update-employee_reassign/New/', views.update_test_employee_reassign, name='update_multiple_test_status'),
 path('api/placement-officers/by-college/<int:college_id>/', views.get_placement_officers_by_college_name, name='get_po_by_college_name'),
 path('api/student/request-company-test/', views.create_student_test_request, name='create_student_test_request'),
path('api/filter-company-test/', views.FilterCompanyTestAPIView.as_view(), name='filter-company-test'),
path('api/stu-practice-test-report/', views.get_view_practiceReport_po, name='get_view_practiceReport_po'),
path('api/daywise-report/', views.DayWiseReportAPIView.as_view(), name='daywise-report'),
path('api/report-filters/', views.ReportFilterOptionsAPIView.as_view(), name='daywise-report'),

path("api/get-folders-by-skilltype/", views.FolderListBySkillTypeAPIView.as_view(), name="get-folders-by-skilltype"),

path("api/add-training-topics/<int:training_id>/", views.add_training_topics, name="add-training-topics"),
path('api/training-schedule/<int:pk>/update-batch-skill/', views.update_batch_skill, name='update-batch-skill'),
 path('api/get-dropdown-filters/', views.get_dropdown_filters, name='get-dropdown-filters'),
 path('api/get-year-wise-topic-filters/', views.download_topics_excel, name='download_topics_excel'),
    path('api/folder_master/Test/', views.FolderMasterListAPItestView.as_view(), name='folder-master-list'),
path('api/get_group_test_name_multiple/', views.get_group_test_name_multiple, name='get_group_test_name_multiple'),
path("api/get-user-colleges/", views.get_user_colleges, name="get_user_colleges"),
path("api/send-otp/", views.send_otp_view, name="send_otp"),
    path("api/verify-otp/", views.verify_otp_view, name="verify_otp"),
 path("api/check-user-status/", views.check_user_status_view, name="check_user_status"),

  path('api/content/tool_access/', views.get_content_tool_access, name='content-list'),
path('api/student-requests/user/<str:user_name>/', views.get_student_requests_by_username, name='student-requests-by-username'),
 path('api/student/request-company/', views.create_student_Company_test_request, name='create_student_Company_test_request'),
path('api/stu-practicegroup-test-report/', views.get_testwise_practiceattended_report, name='get_view_practiceReport_po'),
path('api/topics/<int:topic_id>/sub_topics/', views.SkillTypeListByTopicAPIViewNew.as_view(), name='sub-topic-list'),
    path('api/topics/<int:topic_id>/sub_topics/Modal/', views.SkillTypeListByTopicAPIViewModal.as_view(), name='sub-topic-list'),

path('api/stu-detail/report/', views.get_student_details_report, name='get_student_details_report'),
    # ... other paths
    path('api/students/monthly-indi-report/<int:student_id>/', views.download_student_monthly_report, name='student-monthly-report'),

path("api/send/email/", views.Send_Email_Forget_Password, name="send_email_forget_password"),
 path('api/get_user_role_access/', views.get_user_role_access, name='get_user_role_access'),
path('api/start-reassigned-exam/', views.start_reassigned_exam, name='start_reassigned_exam'),
    path('api/capture-first-login-email/', views.capture_first_login_send_email, name='capture_first_login_send_email'),
path('api/reassign-test-status/refresh/', views.reassign_test_candidates_status_refresh, name='reassign_test_candidates_status_refresh'),
path('api/update_movetab_test/', views.update_movetab_test, name='update_remarks'),
#path('api/run-node/', views.run_node, name='run_node'),
#    path('api/run-springboot/', views.run_springboot, name='run_springboot'),
#path('api/matlab-compiler/', views.run_matlab_code, name='matlab-compiler'),
#    path('api/vlsi-compiler/', views.run_vlsi_code, name='vlsi-compiler'),
# path('api/run-csharp/', views.run_csharp_code, name='run_csharp_code'),
# path('api/run-php/', views.run_php, name='run-php'),
 path('api/update-total-avg-marks/', views.update_total_and_avg_marks, name='update_total_and_avg_marks'),

 path('api/update-total-avg-marks-delete-answer/', views.update_total_and_avg_marks_deleteanswer, name='update_total_and_avg_marks_deleteanswer'),
#path("api/run-mysql/", views.run_mysql, name="run_mysql"),
#path('api/run-jquery/', views.run_jquery, name='run_jquery'),  # ✅ new line added


#_________________________________________aUDIO__________________________________3
 path('api/active-audio-tests/', views.active_audio_tests, name='active_audio_tests'),
path('api/upload-communication-questions/', views.upload_communication_questions, name='upload_communication_test'),
path('api/download-template/', views.download_communication_template, name='download_communication_template'),
path('api/audio-test-details/', views.get_audio_test_details, name='get_audio_test_details'),
path('api/add_or_update_result/', views.add_or_update_result, name='add_or_update_result'),
 path('api/audio-test-types/', views.get_audio_test_types, name='get_audio_tests'),
 path('api/audio-category-questions/<str:category_name>/', views.get_audio_category_questions, name='get_audio_category_questions'),

    path('api/test-candidates-map/create/Audio/', views.TestAssignviewBatchAudio.as_view(), name='test-candidates-map'),
 path("api/excel-ai/", views.excel_ai), 


path("api/translate/", views.translate_text, name="translate-text"),

path("api/translate-voice/", views.translate_voice, name="translate-text"),
path("api/generate-questions/", views.generate_questions),

path("api/get-skill-type-by-test/",views.GetSkillTypeByTestNameView.as_view(),name="get-skill-type-by-test",),
path("api/log-skilltype-question/", views.LogSkillTypeQuestionView.as_view(), name="log-skilltype-question",),
  path('api/Listening-test-count/', views.get_test_listenting_category, name='get_test_count_by_typing_category'),
  
path('api/reading-test-count/', views.get_test_reading_category, name='reading-test-count'),
    path('api/speaking-test-count/', views.get_test_Speaking_category, name='speaking-test-count'),
    path('api/writing-test-count/', views.get_test_Writing_category, name='writing-test-count'),
 path('api/avg-score/listening/',views.get_avg_score_listening_cc,name='avg-score-listening' ),
    path('api/avg-score/speaking/',views.get_avg_score_speaking_cc, name='avg-score-speaking'),
    path('api/avg-score/reading/',views.get_avg_score_reading_cc, name='avg-score-reading'),
    path('api/avg-score/writing/',views.get_avg_score_writing_cc,name='avg-score-writing' ),
 path('api/clg-topper-all/cc/', views.get_College_topper_ccall, name='get_College_topper_ccall'),
   
 path('api/liten-test-count/stu/', views.get_listening_test_stu, name='get_aptitute_test_stu'),
    path('api/speak-test-count/stu/', views.get_speaking_test_stu, name='get_technical_test_stu'),

path('api/reading-test-count/stu/', views.get_Reading_test_stu, name='get_aptitute_test_stu'),
    path('api/writing-test-count/stu/', views.get_Writing_test_stu, name='get_technical_test_stu'),

 path('api/get_student_skill_percentage/', views.get_student_skill_percentage, name='get_technical_test_stu'),

 path( 'api/student-test-summary/commun/', views.student_test_summary_commun, name='student-test-summary'),
path("api/log-audio-test-start/", views.AssignTestToStudentView.as_view(), name="log-audio-test-start"),
 path('api/reports/audio/excel/', views.download_audio_report_excel),
   path('api/department-repo/feedback/', views.get_audio_feedback_report, name='get_audio_avg_report'),

]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
