import csv
from django.utils.timezone import now
from django.core.management.base import BaseCommand
from app.models import tests_candidates_map, tests_candidates_answers
from datetime import datetime

class Command(BaseCommand):
    help = "Back up and delete data from multiple models within a specified date range"

    def handle(self, *args, **kwargs):
        # Define the start and end dates for the range (e.g., Jan 01 to Jan 25)
        start_date = datetime(2025, 1, 1)
        end_date = datetime(2025, 1, 25, 23, 59, 59)  # End date at 23:59:59

        # Process tests_candidates_map
        self.backup_and_delete(
            model=tests_candidates_map,
            file_name_prefix="tests_candidates_map",
            start_date=start_date,
            end_date=end_date,
            headers=[
                'id', 'student_id', 'test_name', 'question_id', 'dtm_start', 'dtm_end', 'dtm_login', 'dtm_submit',
                'dtm_start_test', 'status', 'attempt_count', 'is_camera_on', 'duration', 'duration_type',
                'capture_duration', 'year', 'rules_id', 'video_required', 'is_active', 'need_candidate_info',
                'total_score', 'avg_mark', 'is_upload_type', 'capture_passkey', 'deleted', 'created_by',
                'dtm_created', 'modified_by', 'dtm_modified', 'remarks', 'dev_remarks', 'status'
            ],
            row_callback=lambda entry: [
                entry.id,
                entry.student_id.id if entry.student_id else None,
                entry.test_name,
                entry.question_id.id if entry.question_id else None,
                entry.dtm_start,
                entry.dtm_end,
                entry.dtm_login,
                entry.dtm_submit,
                entry.dtm_start_test,
                entry.status,
                entry.attempt_count,
                entry.is_camera_on,
                entry.duration,
                entry.duration_type,
                entry.capture_duration,
                entry.year,
                entry.rules_id.id if entry.rules_id else None,
                entry.video_required,
                entry.is_active,
                entry.need_candidate_info,
                entry.total_score,
                entry.avg_mark,
                entry.is_upload_type,
                entry.capture_passkey,
                entry.deleted,
                entry.created_by,
                entry.dtm_created,
                entry.modified_by,
                entry.dtm_modified,
                entry.remarks,
                entry.dev_remarks,
                entry.status
            ]
        )

        # Process tests_candidates_answers
        self.backup_and_delete(
            model=tests_candidates_answers,
            file_name_prefix="tests_candidates_answers",
            start_date=start_date,
            end_date=end_date,
            headers=[
                'id', 'student_id', 'test_name', 'question_id', 'answer', 'result',
                'dtm_start', 'submission_compile_code', 'compile_code_editor', 'dtm_end',
                'deleted', 'created_by', 'dtm_created', 'modified_by', 'dtm_modified',
                'remarks', 'dev_remarks'
            ],
            row_callback=lambda entry: [
                entry.id,
                entry.student_id.id if entry.student_id else None,
                entry.test_name,
                entry.question_id.id if entry.question_id else None,
                entry.answer,
                entry.result,
                entry.dtm_start,
                entry.submission_compile_code,
                entry.compile_code_editor,
                entry.dtm_end,
                entry.deleted,
                entry.created_by,
                entry.dtm_created,
                entry.modified_by,
                entry.dtm_modified,
                entry.remarks,
                entry.dev_remarks
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
