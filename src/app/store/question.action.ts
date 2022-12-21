import { createAction, props } from '@ngrx/store';
import {Question} from "../models/form.model";

export const AddQuestion = createAction(
  '[Question] Add Question',
  props<{question: Question[]}>()
);
