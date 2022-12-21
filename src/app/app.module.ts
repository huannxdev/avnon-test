import {TuiDialogModule, TuiRootModule} from "@taiga-ui/core";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {StoreModule} from '@ngrx/store';
import {TUI_VALIDATION_ERRORS} from "@taiga-ui/kit";
import {questionReducer} from "./store/question.reducer";

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    TuiRootModule,
    TuiDialogModule,
    StoreModule.forRoot({questionStore: questionReducer}, {}),
  ],
  providers: [
    {
      provide: TUI_VALIDATION_ERRORS,
      useValue: {required: `Enter this!`},
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
