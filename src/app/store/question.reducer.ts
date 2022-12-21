import {Question} from "../models/form.model";
import {createReducer, on} from "@ngrx/store";
import {AddQuestion} from "./question.action";

export interface QuestionState {
  question: Question[] | null;
}

export const initialState: QuestionState = {
  question: null
};

export const questionReducer = createReducer(
  initialState,
  on(AddQuestion, (state, {question}) => ({question})))
