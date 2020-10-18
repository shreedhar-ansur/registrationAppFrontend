import {Component, OnInit, OnDestroy} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {BehaviorSubject, Observable, Subscription, throwError} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';

class User {
  public name: string;
  public gender: string;
  public country: string;
  public age: number;
  constructor(name: string, gender: string, country: string, age: number) {
    this.name = name;
    this.gender = gender;
    this.country = country;
    this.age = age;
  }
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})

export class RegisterComponent implements OnInit, OnDestroy {
  title = 'angularApp';
  public name: string;
  public user: User = new User('', 'male', '', 1);
  public subscription: Subscription;
  public errorSubscription: Subscription;
  public errorMessages: Map<string, Array<string>> = new Map<string, Array<string>>();
  public countriesList: any = [];
  public formError: boolean;
  public formErrorMessage: string;
  public testEmitter = new BehaviorSubject<any>(this.countriesList);
  public testErrorEmitter = new BehaviorSubject<any>(this.errorMessages);
  constructor(public http: HttpClient, private router: Router, private route: ActivatedRoute) {
  }
  ngOnInit(): void {
    this.subscription = this.testEmitter.asObservable().subscribe(
      countriesList => this.countriesList = countriesList);
    this.errorSubscription = this.testErrorEmitter.asObservable().subscribe(
      errorMessages => this.errorMessages = errorMessages);
    this.populateCountries();
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.errorSubscription.unsubscribe();
  }
  public populateCountries(): void {
    this.getCountries().subscribe((data: any) => {
      const localVar = [];
      data._embedded.countryList.forEach((countryDetail) => {
        localVar.push({id: countryDetail.numericCode, name: countryDetail.name});
      });
      this.testEmitter.next(localVar);
    });
  }
  public getCountries(): Observable<any> {
    return this.http.get('http://localhost:8080/v1/country/');
  }
  public register(): void {
    this.clearErrors();
    if (this.validateData()) {
      this.registerUser(this.user);
    } else {
      this.formError = true;
      this.formErrorMessage = 'Invalid inputs';
    }
  }

  public registerUser(userData): void {
    console.log('registering user');
    const requestBody = {
      user : userData
    };
    this.insertUser(requestBody).subscribe((data: any) => {
      console.log('inserted, response:');
      console.log(data);
      this.router.navigate(['success'], { queryParams: { name: data.name}});
    }, (error: HttpErrorResponse): any => {
      console.log(JSON.parse(JSON.stringify(error.error.error)));
      const map = new Map<string, string[]>();
      for (const k of Object.keys(JSON.parse(JSON.stringify(error.error.error)))) {
        map.set(k, map[k]);
      }
      // this.errorMessages = map;
      this.testErrorEmitter.next(map);
      this.formErrorMessage = 'Error occurred while registering. Please try again.';
      return throwError('error occurred');
    });
  }

  public insertUser(requestBody): Observable<any> {
    return this.http.post('http://localhost:8080/v1/register/', requestBody, {});
  }

  public clearErrors(): void {
    this.errorMessages = new Map();
    this.formErrorMessage = '';
  }

  public validateData(): boolean {
    let flag = true;
    Object.keys(this.user).map(key => {
      const value = this.user[key];
      if (null == value || '' === value.toString().trim()) {
        if ( null == this.errorMessages.get('user.' + key)) {
          this.errorMessages.set('user.' + key, []);
        }
        this.errorMessages.get('user.' + key).push(key + ' cannot be empty');
        flag = false;
      }
    });
    return flag;
  }
}
