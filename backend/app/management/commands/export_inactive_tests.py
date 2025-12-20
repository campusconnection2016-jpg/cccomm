import csv
from django.utils.timezone import now
from django.core.management.base import BaseCommand
from app.models import tests_candidates_map, tests_candidates_answers
from datetime import datetime

class Command(BaseCommand):
    help = "Back up and delete data from multiple models within a specified date range"

    def handle(self, *args, **kwargs):
        # Define the start and end dates for the range (e.g., Jan 01 to Jan 25)
        start_date = datetime(2024, 10, 1)
        end_date = datetime(2024, 10, 30, 23, 59, 59)  # End date at 23:59:59

        # Process tests_candidates_map
        self.backup_and_delete(
            model=tests_candidates_map,
            file_name_prefix="tests_candidates_map",
            start_date=start_date,
            end_date=end_date,
            headers=[
                'id', 'test_name', 'dtm_start', 'dtm_end', 'dtm_login', 'dtm_submit', 
                'dtm_start_test', 'attempt_count', 'is_camera_on', 'duration', 
                'duration_type', 'year', 'video_required', 'is_active', 'need_candidate_info', 
                'total_score', 'avg_mark', 'deleted', 'created_by', 'dtm_created', 
                'modified_by', 'dtm_modified', 'remarks', 'dev_remarks', 'status', 
                'college_id_id', 'department_id_id', 'question_id_id', 'rules_id_id', 
                'student_id_id', 'is_upload_type', 'capture_passkey', 'capture_duration'
            ],
            row_callback=lambda entry: [
                getattr(entry, 'id', None),
                getattr(entry, 'test_name', None),
                getattr(entry, 'dtm_start', None),
                getattr(entry, 'dtm_end', None),
                getattr(entry, 'dtm_login', None),
                getattr(entry, 'dtm_submit', None),
                getattr(entry, 'dtm_start_test', None),
                getattr(entry, 'attempt_count', None),
                getattr(entry, 'is_camera_on', None),
                getattr(entry, 'duration', None),
                getattr(entry, 'duration_type', None),
                getattr(entry, 'year', None),
                getattr(entry, 'video_required', None),
                getattr(entry, 'is_active', None),
                getattr(entry, 'need_candidate_info', None),
                getattr(entry, 'total_score', None),
                getattr(entry, 'avg_mark', None),
                getattr(entry, 'deleted', None),
                getattr(entry, 'created_by', None),
                getattr(entry, 'dtm_created', None),
                getattr(entry, 'modified_by', None),
                getattr(entry, 'dtm_modified', None),
                getattr(entry, 'remarks', None),
                getattr(entry, 'dev_remarks', None),
                getattr(entry, 'status', None),
                getattr(entry, 'college_id_id', None),
                getattr(entry, 'department_id_id', None),
                getattr(entry, 'question_id_id', None),
                getattr(entry, 'rules_id_id', None),
                getattr(entry, 'student_id_id', None),
                getattr(entry, 'is_upload_type', None),
                getattr(entry, 'capture_passkey', None),
                getattr(entry, 'capture_duration', None),
            ]
        )

        # Process tests_candidates_answers
        self.backup_and_delete(
            model=tests_candidates_answers,
            file_name_prefix="tests_candidates_answers",
            start_date=start_date,
            end_date=end_date,
            headers=[
                'id', 'test_name', 'answer', 'result', 'dtm_start', 
                'submission_compile_code', 'compile_code_editor', 'dtm_end', 'deleted', 
                'created_by', 'dtm_created', 'modified_by', 'dtm_modified', 
                'remarks', 'dev_remarks', 'question_id_id', 'student_id_id'
            ],
            row_callback=lambda entry: [
                getattr(entry, 'id', None),
                getattr(entry, 'test_name', None),
                getattr(entry, 'answer', None),
                getattr(entry, 'result', None),
                getattr(entry, 'dtm_start', None),
                getattr(entry, 'submission_compile_code', None),
                getattr(entry, 'compile_code_editor', None),
                getattr(entry, 'dtm_end', None),
                getattr(entry, 'deleted', None),
                getattr(entry, 'created_by', None),
                getattr(entry, 'dtm_created', None),
                getattr(entry, 'modified_by', None),
                getattr(entry, 'dtm_modified', None),
                getattr(entry, 'remarks', None),
                getattr(entry, 'dev_remarks', None),
                getattr(entry, 'question_id_id', None),
                getattr(entry, 'student_id_id', None),
            ]
        )

    def backup_and_delete(self, model, file_name_prefix, start_date, end_date, headers, row_callback):
        # Query data within the specified date range
        entries_in_range = model.objects.filter(dtm_start__gte=start_date, dtm_start__lte=end_date)

        if not entries_in_range.exists():
            self.stdout.write(self.style.WARNING(f"No data found for {model.__name__} between {start_date} and {end_date}."))
            return

        # Generate a unique file name with timestamp
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        file_path = f'{file_name_prefix}_backup_{start_date.strftime("%Y%m%d")}_to_{end_date.strftime("%Y%m%d")}_{timestamp}.csv'

        # Create and write to the CSV file
        with open(file_path, mode='w', newline='', encoding='utf-8') as file:
            writer = csv.writer(file)
            writer.writerow(headers)  # Write headers
            for entry in entries_in_range:
                writer.writerow(row_callback(entry))

        # Delete the entries from the database
        deleted_count, _ = entries_in_range.delete()

        # Log success messages
        self.stdout.write(self.style.SUCCESS(f"Data for {model.__name__} exported to {file_path}"))
        self.stdout.write(self.style.SUCCESS(f"Deleted {deleted_count} entries from {model.__name__} database."))
