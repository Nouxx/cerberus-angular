import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
declare function scrollToId(id: string);

export class Alert {
  message: string; // mandatory
  style: string; // mandatory
  duration: number; // 0 or less = sticky
  animationIn?: string;
  animationOut?: string;
  current_animation?: string;
  index?: number;
}

// for developers : set to true in order to avoid the alerts to disappear
const debugMode = false;
const animationDuration = 500;

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  private alertsList: Array<Alert> = new Array<Alert>();
  observableAlerts = new BehaviorSubject<Alert[]>(this.alertsList);

  constructor() { }

  generateRandomIndex(): number {
    return Math.floor(Math.random() * (999999 - 100000)) + 100000;
  }

  displayMessage(alert: Alert) {
    // put the default animation value if empty
    if (!alert.animationIn) { alert.current_animation = "fadeInDown"; } else { alert.current_animation = alert.animationIn; }
    // add the message in the list, if it isn't a duplicate
    if (!this.isAlertPresent(alert)) {
      this.alertsList.push(alert);
      this.observableAlerts.next(this.alertsList);
      scrollToId("main-container");
      // if the duration isn't set to infinite
      if (!debugMode && alert.duration > 0) {
        var displayTime = setInterval(() => {
          this.closeMessage(alert, 0);
          clearInterval(displayTime);
        }, alert.duration)
      }
    }
  }

  closeMessage(alert: Alert, index: number) {
    // verify that the alert is still in the list, if so, delete it
    if (this.isAlertPresent(alert)) {
      if (!alert.animationOut) { alert.current_animation = "fadeOut"; } else { alert.current_animation = alert.animationOut; }
      var animationOutTime = setInterval(() => {
        if (this.isAlertPresent(alert)) {
          this.alertsList.splice(index, 1);
          this.observableAlerts.next(this.alertsList);
          clearInterval(animationOutTime);
        }
      }, animationDuration - 200)
    }
  }

  isAlertPresent(alert: Alert) {
    return this.alertsList.filter(a => a === alert).length > 0;
  }

}
