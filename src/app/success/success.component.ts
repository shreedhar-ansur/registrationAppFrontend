import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute, ParamMap} from '@angular/router';

@Component({
  selector: 'app-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.css']
})
export class SuccessComponent implements OnInit {

  constructor(private route: ActivatedRoute) { }
  public name: string;
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.name = params.name;
    });
  }

}
