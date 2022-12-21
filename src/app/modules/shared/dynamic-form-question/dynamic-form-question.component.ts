import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {AnswerOption, AnswerType, Question} from "../../../models/form.model";
import {TuiCheckboxLabeledModule, TuiCheckboxModule, TuiFieldErrorPipeModule, TuiTextAreaModule} from "@taiga-ui/kit";
import {TuiErrorModule, TuiTextfieldControllerModule} from "@taiga-ui/core";
import {TuiValidationError} from "@taiga-ui/cdk";
import {debounceTime, distinctUntilChanged, Subject, takeUntil} from "rxjs";

@Component({
  selector: 'app-dynamic-form-question',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TuiCheckboxLabeledModule, TuiErrorModule, TuiFieldErrorPipeModule, TuiCheckboxModule, TuiTextfieldControllerModule, TuiTextAreaModule],
  templateUrl: './dynamic-form-question.component.html',
  styleUrls: ['./dynamic-form-question.component.scss']
})
export class DynamicFormQuestionComponent implements OnInit, OnDestroy {

  @Input() question!: Question;
  @Input() form!: FormGroup;
  AnswerType = AnswerType;
  answers: AnswerOption[] = [];
  error = new TuiValidationError(`This field is required`);
  otherFormControl = new FormControl('');
  private destroy$ = new Subject();

  get computedError(): TuiValidationError | null {
    const control = this.form.controls[this.question.key];
    return control.invalid && (control.touched || control.dirty) ? this.error : null;
  }

  ngOnInit() {
    if (this.question.answerType === AnswerType.Checkbox && this.question.answerOptions && this.question.answerOptions.length > 0) {
      this.answers = this.question.answerOptions.map(option => {
        if (option.isOther && option.checked) {
          this.otherFormControl.setValue(option.optionalValue || '');
        }
        return Object.assign({}, option);
      });
    }

    this.otherFormControl.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(val => {
      const index = this.answers.findIndex(answer => answer.isOther);
      this.answers[index].optionalValue = val?.trim() || '';
      this.onCheckboxChange();
    })
  }

  onCheckboxChange(checkbox?: AnswerOption) {
    if (checkbox?.isOther && !checkbox.checked) {
      this.otherFormControl.setValue('');
    }
    this.form.controls[this.question.key].setValue(this.answers);
  }

  ngOnDestroy(): void {
    this.destroy$.next(1);
    this.destroy$.complete();
  }
}
