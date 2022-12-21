import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, Injector, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TuiButtonModule, TuiDialogModule, TuiDialogService} from "@taiga-ui/core";
import {AddQuestionModalComponent} from "../add-question-modal/add-question-modal.component";
import {PolymorpheusComponent} from '@tinkoff/ng-polymorpheus';
import {AnswerOption, AnswerType, Question} from "../../../models/form.model";
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from "@angular/forms";
import {DynamicFormQuestionComponent} from "../../shared/dynamic-form-question/dynamic-form-question.component";
import {Store} from "@ngrx/store";
import {AddQuestion} from "../../../store/question.action";
import {Router} from "@angular/router";
import {AppState} from "../../../store";
import {take} from "rxjs";
import {BLANK_SPACE_REGEX} from "../../../models/form.const";

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [CommonModule, TuiDialogModule, ReactiveFormsModule, DynamicFormQuestionComponent, TuiButtonModule],
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormComponent implements OnInit {
  questions: Question[] = [];
  form!: FormGroup;

  constructor(@Inject(TuiDialogService) private readonly dialogService: TuiDialogService,
              @Inject(Injector) private readonly injector: Injector, private cdr: ChangeDetectorRef,
              private store: Store<AppState>, private router: Router) {
  }

  private readonly dialog = this.dialogService.open<Question>(new PolymorpheusComponent(AddQuestionModalComponent, this.injector), {dismissible: true});

  ngOnInit(): void {
    this.store.select(state => state.questionStore.question).pipe(
      take(1)
    ).subscribe(questions => {
      if (questions) {
        this.questions = questions;
      }
      this.form = this.toFormGroup(this.questions);
      this.cdr.markForCheck();
    });
  }

  openNewQuestionModal(): void {
    this.dialog.subscribe({
      next: data => {
        this.questions = [...this.questions, data];
        this.addControlToFormGroup(data);
        this.cdr.markForCheck();
      },
    });
  }

  review() {
    this.form.markAllAsTouched();
    if (this.form.valid) {
      this.questions = this.questions.map(question => {
        const value = this.form.controls[question.key].value;
        return {
          ...question, textAnswers: question.answerType === AnswerType.Paragraph ? value?.trim() : '',
          answerOptions: question.answerType === AnswerType.Checkbox ? value : []
        };
      });
      this.store.dispatch(AddQuestion({question: this.questions}));
      this.router.navigateByUrl('form/answer');
    }
  }

  private toFormGroup(questions: Question[]) {
    const group: any = {};

    questions.forEach(question => {
      group[question.key] = this.createNewFormControl(question);
    });
    return new FormGroup(group);
  }

  private addControlToFormGroup(question: Question): void {
    this.form.addControl(question.key, this.createNewFormControl(question));
    this.form.updateValueAndValidity();
  }

  private createNewFormControl(question: Question) {
    return question.answerType === AnswerType.Paragraph ? new FormControl(question.textAnswers || '', [Validators.pattern(BLANK_SPACE_REGEX), ...(question.isRequired ? [Validators.required] : [])])
      : new FormControl(question.answerOptions || [], question.isRequired ? this.checkboxAnswerValidator() : null);
  }

  private checkboxAnswerValidator(): ValidatorFn {
    return (control: AbstractControl<AnswerOption[]>): ValidationErrors | null => {
      const value = control.value;
      if (value.length > 0 && value.some(option => !!option.checked)) return null;
      return {required: true};
    }
  }
}
