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
  public formErrorSubscription: Subscription;
  public errorMessages: Map<string, Array<string>> = new Map<string, Array<string>>();
  public countriesList: any = [];
  public formError: boolean;
  public formErrorMessage = '';
  public testEmitter = new BehaviorSubject<any>(this.countriesList);
  public testErrorEmitter = new BehaviorSubject<Map<string, Array<string>>>(this.errorMessages);
  public testFormErrorEmitter = new BehaviorSubject<string>(this.formErrorMessage);
  constructor(public http: HttpClient, private router: Router, private route: ActivatedRoute) {
  }
  ngOnInit(): void {
    this.subscription = this.testEmitter.asObservable().subscribe(
      countriesList => this.countriesList = countriesList);
    this.errorSubscription = this.testErrorEmitter.asObservable().subscribe(
      errorMessages => this.errorMessages = errorMessages);
    this.formErrorSubscription = this.testFormErrorEmitter.asObservable().subscribe(
      formErrorMessages => this.formErrorMessage = formErrorMessages);
    this.populateCountries();
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.errorSubscription.unsubscribe();
    this.formErrorSubscription.unsubscribe();
  }
  public populateCountries(): void {
    this.getCountries().subscribe((data: any) => {
      const localVar = [];
      data._embedded.countryList.forEach((countryDetail) => {
        localVar.push({id: countryDetail.numericCode, name: countryDetail.name});
      });
      this.testEmitter.next(localVar);
    }, (error: HttpErrorResponse): any => {
      this.errorMessages.set('user.country', ['could not fetch country details.']);
      this.testErrorEmitter.next(this.errorMessages);
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
      if (error.status === 400) {
        const map = JSON.parse(JSON.stringify(error.error.error));
        Object.keys(map).map(key => {
          if ( null == this.errorMessages.get(key)) {
            this.errorMessages.set(key, []);
          }
          this.errorMessages.get(key).push(map[key]);
        });
        // this.errorMessages = map;
        console.log('this.errorMessages');
        console.log(this.errorMessages);
        this.testErrorEmitter.next(this.errorMessages);
      }
      console.log('error');
      console.log(error);
      this.formError = true;
      this.formErrorMessage = 'Error occurred while registering.';
      this.testFormErrorEmitter.next('Error occurred while registering.');
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
