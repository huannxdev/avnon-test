import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {TuiCheckboxLabeledModule, TuiFieldErrorPipeModule, TuiInputModule, TuiSelectModule} from "@taiga-ui/kit";
import {AnswerType, AnswerTypeOption, NewQuestionForm, Question} from "../../../models/form.model";
import {Subject, takeUntil, tap} from "rxjs";
import {
  TuiButtonModule,
  TuiDataListModule,
  TuiDialogContext,
  TuiDialogService,
  TuiErrorModule,
  TuiTextfieldControllerModule
} from "@taiga-ui/core";
import {POLYMORPHEUS_CONTEXT} from '@tinkoff/ng-polymorpheus';
import {getUniqueId} from "../../../utils/uuid.util";
import {TuiContextWithImplicit, tuiPure, TuiStringHandler} from "@taiga-ui/cdk";
import {BLANK_SPACE_REGEX} from "../../../models/form.const";

@Component({
  selector: 'app-add-question-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TuiSelectModule, TuiInputModule, TuiTextfieldControllerModule, TuiDataListModule, TuiButtonModule, TuiCheckboxLabeledModule, TuiErrorModule, TuiFieldErrorPipeModule],
  templateUrl: './add-question-modal.component.html',
  styleUrls: ['./add-question-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddQuestionModalComponent implements OnInit, OnDestroy {

  constructor(private cdr: ChangeDetectorRef, @Inject(TuiDialogService) private readonly dialogService: TuiDialogService,
              @Inject(POLYMORPHEUS_CONTEXT)
              private readonly context: TuiDialogContext<Question, Question>,) {
  }

  answerTypeOptions: AnswerTypeOption[] = [
    {
      label: 'Check Box',
      value: AnswerType.Checkbox
    },
    {
      label: 'Paragraph',
      value: AnswerType.Paragraph
    }
  ];
  formQuestion!: FormGroup<NewQuestionForm>;
  AnswerType = AnswerType;
  private destroy$ = new Subject();

  get answerTypeControl(): FormControl<AnswerType | null> {
    return this.formQuestion.controls.answerType;
  }

  get answerOptionsControl() {
    return this.formQuestion.controls.answerOptions;
  }

  ngOnInit(): void {
    this.initForm();
  }

  onSubmit(): void {
    this.formQuestion.markAllAsTouched();
    if (this.formQuestion.valid) {
      const {answerType, title, answerOptions, isRequired, allowAddMoreAnswer} = this.formQuestion.value;
      const question: Question = {
        ...this.formQuestion.value,
        key: getUniqueId(2),
        textAnswers: '',
        title: title?.trim() || '',
        answerType: answerType || AnswerType.Checkbox,
        isRequired: !!isRequired,
        answerOptions: answerOptions?.map(value => ({
          label: value?.trim() || '',
          value: value?.trim() || '',
          checked: false
        })),
      }
      if (allowAddMoreAnswer) {
        question.answerOptions?.push({label: 'Other', value: 'Other', checked: false, isOther: true})
      }
      this.context.completeWith(question);
    }
  }

  addMoreAnswerOption() {
    if (this.answerOptionsControl?.length === 5) return;
    this.answerOptionsControl?.push(new FormControl<string | null>('', [Validators.required, Validators.pattern(BLANK_SPACE_REGEX)]));
  }

  @tuiPure
  stringify(
    items: readonly AnswerTypeOption[],
  ): TuiStringHandler<TuiContextWithImplicit<number>> {
    const map = new Map(items.map(({label, value}) => [value, label] as [number, string]));

    return ({$implicit}: TuiContextWithImplicit<number>) => map.get($implicit) || ``;
  }

  private initForm(): void {
    this.formQuestion = new FormGroup<NewQuestionForm>({
      answerType: new FormControl(null, Validators.required),
      isRequired: new FormControl(false),
      title: new FormControl<string>('', [Validators.required, Validators.pattern(BLANK_SPACE_REGEX)]),
    });

    this.formQuestion.controls.answerType.valueChanges.pipe(
      tap(val => {
        if (val === AnswerType.Checkbox) {
          this.formQuestion.addControl(
            'answerOptions',
            new FormArray([
              new FormControl('', [Validators.required, Validators.pattern(BLANK_SPACE_REGEX)])
            ])
          )
          this.formQuestion.addControl(
            'allowAddMoreAnswer',
            new FormControl(false)
          );
        } else {
          this.formQuestion.removeControl('answerOptions');
          this.formQuestion.removeControl('allowAddMoreAnswer');
        }
        this.formQuestion.updateValueAndValidity();
        this.cdr.markForCheck();
      }),
      takeUntil(this.destroy$)
    ).subscribe()
  }

  ngOnDestroy(): void {
    this.destroy$.next(1);
    this.destroy$.complete();
  }
}
