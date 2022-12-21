import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {Observable} from "rxjs";
import {AnswerOption, AnswerType, Question} from "../../models/form.model";
import {Store} from "@ngrx/store";
import {AsyncPipe, NgForOf, NgIf, TitleCasePipe} from "@angular/common";
import {RouterLinkWithHref} from "@angular/router";
import {AppState} from "../../store";
import {TuiMapperPipeModule} from "@taiga-ui/cdk";

@Component({
  selector: 'app-answer-preview',
  templateUrl: './answer-preview.component.html',
  styleUrls: ['./answer-preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    NgForOf,
    NgIf,
    TitleCasePipe,
    RouterLinkWithHref,
    TuiMapperPipeModule
  ],
  standalone: true
})
export class AnswerPreviewComponent implements OnInit {

  constructor(private store: Store<AppState>) {
  }

  questionList$!: Observable<Question[] | null>;
  AnswerType = AnswerType;

  ngOnInit(): void {
    this.questionList$ = this.store.select(state => state.questionStore.question);
  }

  filterAnswerCheckBox(checkboxAnswers?: AnswerOption[]): AnswerOption[] {
    return checkboxAnswers?.filter(answer => answer.checked) || [];
  }

}
