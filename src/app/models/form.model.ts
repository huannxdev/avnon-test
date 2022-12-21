import {FormArray, FormControl} from "@angular/forms";

export type AnswerTypeOption = { label: string, value: AnswerType };

export enum AnswerType {
  Checkbox,
  Paragraph
}

export type Question = {
  title: string,
  key: string,
  answerType: AnswerType,
  isRequired: boolean,
  answerOptions?: AnswerOption[];
  textAnswers: string;
}

export type NewQuestionForm = {
  title: FormControl<string | null>,
  isRequired: FormControl<boolean | null>,
  answerType: FormControl<AnswerType | null>
  answerOptions?: FormArray<FormControl<string | null>>;
  allowAddMoreAnswer?: FormControl<boolean | null>
}

export type AnswerOption = { label: string, value: string, checked?: boolean, isOther?: boolean, optionalValue?: string };
