import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {map, Observable} from 'rxjs';
import {Store} from "@ngrx/store";
import {AppState} from "../store";

@Injectable({
  providedIn: 'root'
})
export class AnswerGuard implements CanActivate {
  constructor(private store: Store<AppState>, private router: Router) {
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.store.select(state => state.questionStore.question).pipe(
      map(val => {
        if (!val || val.length === 0) {
          this.router.navigateByUrl('form/builder');
          return false;
        }
        return true;
      }),
    )
  }
}
