import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { TestFolder } from 'src/app/shared/model/back/testfolder/test.model';
import { TestCase } from 'src/app/shared/model/back/testcase/testcase.model';
import { TrueindexPipe } from 'src/app/shared/pipes/trueindex.pipe';
import { environment } from 'src/environments/environment';
import { NotificationService } from '../../utils/notification.service';
import { tap } from 'rxjs/operators';
import { NotificationStyle } from '../../utils/notification.model';
import { Invariant } from 'src/app/shared/model/back/invariant/invariant.model';
import { GlobalService } from '../../utils/global.service';
import { PropertyValue, PropertyGroup } from 'src/app/shared/model/back/testcase/property.model';
import { Control } from 'src/app/shared/model/back/testcase/control.model';
import { Action } from 'src/app/shared/model/back/testcase/action.model';
import { Step } from 'src/app/shared/model/back/testcase/step.model';
import { MassActionField } from 'src/app/feat-design/testcaselist/actions/massactions/massactions.model';

@Injectable({
  providedIn: 'root'
})
export class TestcaseService {

  // list of test folders
  testsList: Array<TestFolder> = [];

  // list of testcase object corresponding to the previous test folders list
  testcasesList: Array<TestCase> = [];

  // list of testcase id corresponding to a test folder used for dependencies management
  testCasesList4Dependencies: Array<TestCase> = [];

  // full testcase object
  testcase: TestCase = null;

  // list of library steps
  libraryStepList: Array<Step> = new Array<Step>();

  // observables
  observableTestsList = new BehaviorSubject<TestFolder[]>(this.testsList);
  observableTestCasesList = new BehaviorSubject<TestCase[]>(this.testcasesList);
  observableTestDataLib = new BehaviorSubject<any[]>(this.testcasesList);
  observableTestCase = new BehaviorSubject<TestCase>(this.testcase);
  observableLibraryStepList = new BehaviorSubject<Step[]>(this.libraryStepList);
  observableTestCasesList4Dependencies = new BehaviorSubject<TestCase[]>(this.testCasesList4Dependencies);

  constructor(
    private http: HttpClient,
    private trueindexPipe: TrueindexPipe,
    private notificationService: NotificationService,
    private globalService: GlobalService
  ) { }

  /**
   * refresh the test folder list, used in testcaseselector component
  */
  refreshTestFolders() {
    this.http.get<TestFolder[]>(environment.cerberus_api_url + '/ReadTest')
      .subscribe(response => {
        // @ts-ignore
        if (response.iTotalRecords > 0) {
          // @ts-ignore
          this.testsList = response.contentTable;
          this.observableTestsList.next(this.testsList);
        } else {
          this.testsList = null;
          this.observableTestsList.next(this.testsList);
        }
      });
  }

  /**
   * return the test cases list for a test folder, used in testcaseselector component
   * @param test test folder name to filter on
  */
  refreshTestCasesForATestFolder(test: string) {
    this.http.get<TestCase>(environment.cerberus_api_url + '/ReadTestCase?test=' + test)
      .subscribe(response => {
        if (response) {
          // @ts-ignore
          this.testcasesList = response.contentTable;
          this.observableTestCasesList.next(this.testcasesList);
        }
      });
  }

  /**
  * get the list of test cases from the API
  * @param callback function to use to process the result
  * @param test test folder name to filter on (optional)
  */
  getTestCases(callback: (testcases: TestCase[]) => void, test?: string): void {
    let url = environment.cerberus_api_url + '/ReadTestCase';
    // if the optional parameter test is defined
    if (!this.globalService.isNullOrEmpty(test)) {
      // add the test query string
      url += '?test=' + test;
    }
    this.http.get<TestCase[]>(url)
      .toPromise()
      .then((result: any) => {
        callback(result.contentTable);
      });
  }

  /**
   * refresh the test cases list that is used for dependencies management
   * @param test test folder name to filter on
  */
  // TODO : use the refreshTestCases method instead, and remove this one
  refreshTestCasesList4Dependencies(test: string) {
    this.http.get<Array<TestCase>>(environment.cerberus_api_url + '/ReadTestCase?test=' + test)
      .subscribe(response => {
        if (response) {
          // @ts-ignore
          this.testCasesList4Dependencies = response.contentTable;
          this.observableTestCasesList4Dependencies.next(this.testCasesList4Dependencies);
        }
      });
  }

  /**
   * return the list of library steps for a system (or without)
   * @param callback return the results
   * @param system invariant value
  */
  getLibraryStepList(callback: (stepsList: Step[]) => void, system?: string) {
    // if the system is defined
    if (system) {
      this.http.get<Step[]>(environment.cerberus_api_url + '/GetStepInLibrary?system=' + system)
        .toPromise()
        .then((response: any) => {
          if (response) {
            // DIRTY : add the new attribute 'stepId' : waiting for https://github.com/cerberustesting/cerberus-source/issues/2124
            response.testCaseSteps.forEach(step => {
              step.stepId = step.step;
            });
            callback(response.testCaseSteps);
          }
        });
    }
  }

  /**
   * return a step object
   * @param test name of the tets folder
   * @param testcase test case id
   * @param stepId unique id of the step of that test case to fetch
   */
  getStep(test: string, testcase: string, stepId: number, callback: (step: Step) => void) {
    this.http.get<Step>(environment.cerberus_api_url + '/ReadTestCaseStep?test=' + encodeURIComponent(test) + '&testcase=' + encodeURIComponent(testcase) + '&step=' + stepId)
      .toPromise()
      .then((response: any) => {
        if (response) {
          // DIRTY : waiting for : https://github.com/cerberustesting/cerberus-source/issues/2122
          const rawStep = response.step;
          rawStep.actions = response.tcsActions;
          rawStep.actions.forEach(action => {
            action.controls = response.tcsActionControls.filter(control => control.actionId === action.actionId);
          });
          const formattedStep = this.formatStep(rawStep);
          callback(formattedStep);
        }
      });
  }

  // return true if the testcase ID is in the incremental format
  // e.g. 0001A
  isATestCaseIdIsIncremental(testcase: string): boolean {
    // check that the last caracter is 'A'
    if (testcase.substr(testcase.length - 1) === 'A') {
      // remove the last caracter 'A'
      const testcaseWithoutA = testcase.substr(0, testcase.length - 1);
      // check that the previous caracters are numbers
      if (!isNaN(Number(testcaseWithoutA))) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  updateTestCase(queryString) {
    return this.http.post<any>(environment.cerberus_api_url + '/UpdateTestCase', queryString, environment.httpOptions)
      .pipe(tap(
        data => {
          this.notificationService.cerberusAPINotification(data.messageType, data.message, '_updateTestCaseHeader');
        }
      ));
  }

  createTestCase(queryString) {
    return this.http.post<any>(environment.cerberus_api_url + '/CreateTestCase', queryString, environment.httpOptions)
      .pipe(tap(
        data => {
          if (data.messageType === 'OK') {
            this.notificationService.createANotification('Testcase created', NotificationStyle.Success, 'notification_testCaseCreated');
          } else {
            this.notificationService.createANotification(data.message, NotificationStyle.Warning, 'notification_testCaseCreationWarning');
          }
        },
        error => this.notificationService.createANotification('Error : ' + error.status, NotificationStyle.Error, 'notification_testCaseCreationError')
      ));
  }

  deleteTestCase(test: string, testCase: string, callback: (msg: string, status: string) => void) {
    this.http.post<any>(environment.cerberus_api_url + '/DeleteTestCase', 'test=' + encodeURIComponent(test) + '&testCase=' + encodeURIComponent(testCase), environment.httpOptions)
      .subscribe((rep) => callback(rep.message, rep.messageType));
  }

  /**
  * Gets test case full content
  * @param test
  * @param testcase
  * @returns test case object
  */
  getTestCase(test: string, testcase: string, callback): Promise<TestCase> {
    if (!this.globalService.isNullOrEmpty(test) || !this.globalService.isNullOrEmpty(testcase)) {
      const promise = new Promise<TestCase>((resolve, reject) => {
        this.http
          .get<TestCase>(environment.cerberus_api_url + '/ReadTestCase?test=' + test + '&testCase=' + testcase + '&withSteps=true')
          .toPromise()
          .then((result: any) => {
            let tc = result.contentTable[0];
            // format the test case to match the targeted model
            tc = this.formatTestCase(tc);
            callback(tc);
            resolve();
          },
            err => {
              // Error
              reject(err);
            }
          );
      });
      return promise;
    }
  }

  /**
 * format the input test case to the current model (dirty)
 * @param testcase object to transform
 */
  formatTestCase(testcase: any): TestCase {
    const formattedTestCase = testcase;
    formattedTestCase.conditionValue1 = testcase.conditionVal1;
    formattedTestCase.conditionValue2 = testcase.conditionVal2;
    formattedTestCase.conditionValue3 = testcase.conditionVal3;
    formattedTestCase.steps.forEach(step => {
      step = this.formatStep(step);
    });
    return testcase;
  }

  /**
   * format the input step to the current model (dirty)
   * @param step object to transform
   */
  formatStep(step: any): Step {
    const formattedStep = step;
    formattedStep.isExecutionForced = this.globalService.toCerberusBoolean(step.isExecutionForced);
    formattedStep.isUsingLibraryStep = this.globalService.toCerberusBoolean(step.isUsedStep);
    formattedStep.isLibraryStep = this.globalService.toCerberusBoolean(step.isLibraryStep);
    formattedStep.conditionValue1 = formattedStep.conditionVal1;
    formattedStep.conditionValue2 = formattedStep.conditionVal2;
    formattedStep.conditionValue3 = formattedStep.conditionVal3;
    // format its actions and steps
    formattedStep.actions.forEach(action => {
      action.controls.forEach(control => {
        control = this.formatControl(control);
      });
      action = this.formatAction(action);
    });
    return formattedStep;
  }

  /**
 * format the input step to the current model (dirty)
 * @param action object to transform
 */
  formatAction(action: any): Action {
    const formattedAction = action;
    formattedAction.conditionValue1 = action.conditionVal1;
    formattedAction.conditionValue2 = action.conditionVal2;
    formattedAction.conditionValue3 = action.conditionVal3;
    if (action.isFatal === 'PE') {
      formattedAction.isFatal = true;
    } else {
      formattedAction.isFatal = false;
    }
    return formattedAction;
  }

  /**
 * format the input step to the current model (dirty)
 * @param control object to transform
 */
  formatControl(control: any): Control {
    const formattedControl = control;
    formattedControl.conditionValue1 = control.conditionVal1;
    formattedControl.conditionValue2 = control.conditionVal2;
    formattedControl.conditionValue3 = control.conditionVal3;
    formattedControl.isFatal = this.globalService.toCerberusBoolean(control.isFatal);
    return formattedControl;
  }

  /**
  * Gets only test case header information
  * /!\ do not provide script and properties
  * @param test
  * @param testcase
  * @returns test case header object
  */
  getTestCaseHeader(test: string, testcase: string, callback): Promise<TestCase> {
    const promise = new Promise<TestCase>((resolve, reject) => {
      this.http
        .get<TestCase>(environment.cerberus_api_url + '/ReadTestCase?test=' + test + '&testCase=' + testcase)
        .toPromise()
        .then((result: any) => {
          // Success
          callback(result.contentTable[0]);
          resolve();
        },
          err => {
            // Error
            reject(err);
          }
        );
    });
    return promise;
  }

  /**
   * get the latest incremental ID for a test folder
   * @param test test folder name
  */
  getMaxTestCase(test: string, callback: (nextAvailableTestcaseId: string) => void): void {
    const url = environment.cerberus_api_url + '/ReadTestCase?test=' + test + '&getMaxTC=true';
    this.http.get<any[]>(url)
      .subscribe(response => {
        // @ts-ignore
        callback(response.nextAvailableTestcaseId);
      });
  }

  /**
   * return the list of use step spread over testcases for a specific testcase step
   * @param test test folder name
   * @param testcase testcase id
   * @param stepId unique step id
   * @param callback function called with the results
   */
  getUseStepForALibraryStep(test: string, testcase: string, stepId: number, callback): Promise<Step[]> {
    const promise = new Promise<Step[]>((resolve, reject) => {
      this.http
        .get<Step[]>(environment.cerberus_api_url + '/ReadTestCaseStep?test=' + encodeURIComponent(test) + '&testCase=' + encodeURIComponent(testcase) + '&step=' + stepId + '&getUses=true')
        .toPromise()
        .then((result: any) => {
          callback(result.contentTable);
          // callback(list_usesteps_mock.step);
          resolve();
        },
          err => {
            // Error
            reject(err);
          }
        );
    });
    return promise;
  }

  /**
   * return true if a test case is present in a list
   * @param testcaseid test case id to check
   * @param testcases list of test cases to use
   */
  selectedTestCaseExist(testcaseid: string, testcases: Array<TestCase>): boolean {
    return testcases.filter(tc => tc.testcase === testcaseid).length > 0;
  }

  /**
   * return true if the country is selected for the test case
   * @param countries list of countries to search into
   * @param country country value of the country to check
  */
  isCountryDefinedForTestCase(countries: Invariant[], country: string): boolean {
    const res = countries.find(invariant => invariant.value === country);
    if (res) { return true; } else { return false; }
  }

  /** refresh the sort attribute of each steps (usefull for drag and drop)
  * @param steps list of step to reorder
  */
  refreshStepSort(steps: Array<Step>): void {
    steps.forEach((step, index) => {
      const newIndex = this.trueindexPipe.transform(index);
      step.sort = newIndex;
    });
  }

  /** refresh the sort attribute of each actions (usefull for drag and drop)
   * @param actions list of actions to reorder
   */
  refreshActionsSort(actions: Array<Action>): void {
    actions.forEach((action, index) => {
      const newIndex = this.trueindexPipe.transform(index);
      action.sort = newIndex;
    });
  }

  /** refresh the sort attribute of each control (usefull for drag and drop)
  * @param controls list of control to reorder
  */
  refreshControlSort(controls: Array<Control>): void {
    controls.forEach((control, index) => {
      const newIndex = this.trueindexPipe.transform(index);
      control.sort = newIndex;
    });
  }

  saveTestCase(testcase: TestCase, callback: (response: any) => void) {
    // declare the object to be send to /UpdateTestCaseWithDependencies
    let requestPayload: any;
    // instantiate it
    requestPayload = {};
    // pass the test and test case information
    requestPayload.informationInitialTest = testcase.test;
    requestPayload.informationInitialTestCase = testcase.testcase;
    requestPayload.informationTest = testcase.test;
    requestPayload.informationTestCase = testcase.testcase;
    // fill the step array
    requestPayload.stepArray = [];
    testcase.steps.forEach(step => {
      // create a new 'step' object (to pass only the necessary fields)
      let newStep: any;
      newStep = {};
      newStep.toDelete = step.toDelete || false;
      // test folder and test case id are only needed for existing steps
      if (step.test) { newStep.test = step.test; }
      if (step.testcase) { newStep.testcase = step.testcase; }
      // unique step id only necessary for existing step
      if (step.stepId) { newStep.step = step.stepId; }
      newStep.sort = step.sort;
      newStep.description = step.description;
      newStep.isUsedStep = step.isUsingLibraryStep;
      newStep.libraryStepTest = step.libraryStepTest;
      newStep.libraryStepTestCase = step.libraryStepTestcase;
      newStep.libraryStepStepId = step.libraryStepStepId;
      newStep.isLibraryStep = step.isLibraryStep;
      newStep.loop = step.loop;
      newStep.conditionOperator = step.conditionOperator;
      newStep.conditionVal1 = step.conditionValue1;
      newStep.conditionVal2 = step.conditionValue2;
      newStep.conditionVal3 = step.conditionValue3;
      newStep.isExecutionForced = step.isExecutionForced;
      newStep.actionArr = [];
      step.actions.forEach(action => {
        // create a new action object (because the mapping is different)
        let newAction: any;
        newAction = {};
        newAction.controlArr = [];
        newAction.toDelete = action.toDelete || false;
        // test folder and test case id are empty for new action
        newAction.test = action.test;
        newAction.testcase = action.testcase;
        newAction.step = action.stepId;
        // add the sequence only if it defined
        if (action.actionId) { newAction.sequence = action.actionId; }
        newAction.sort = action.sort;
        newAction.description = action.description;
        newAction.action = action.action;
        // wrong mapping object = value 1
        newAction.object = action.value1;
        // wrong mapping property = value 2
        newAction.property = action.value2;
        newAction.value3 = action.value3;
        newAction.forceExeStatus = action.isFatal;
        newAction.conditionOper = action.conditionOperator;
        newAction.conditionVal1 = action.conditionValue1;
        newAction.conditionVal2 = action.conditionValue2;
        newAction.conditionVal3 = action.conditionValue3;
        newAction.screenshotFileName = action.screenshotFilename;
        action.controls.forEach(control => {
          // create a new control object (because the mapping is different)
          let newControl: any;
          newControl = {};
          newControl.toDelete = control.toDelete || false;
          newControl.test = control.test;
          newControl.testCase = control.testcase;
          newControl.step = control.stepId;
          if (control.actionId) { newControl.actionId = control.actionId; }
          if (control.controlId) { newControl.controlId = control.controlId; }
          newControl.control = control.control;
          newControl.sort = control.sort;
          newControl.description = control.description;
          newControl.value1 = control.value1;
          newControl.value2 = control.value2;
          newControl.value3 = control.value3;
          newControl.fatal = control.isFatal;
          newControl.conditionOper = control.conditionOperator;
          newControl.conditionVal1 = control.conditionValue1;
          newControl.conditionVal2 = control.conditionValue2;
          newControl.conditionVal3 = control.conditionValue3;
          newControl.screenshotFileName = control.screenshotFilename;
          newAction.controlArr.push(newControl);
        });
        newStep.actionArr.push(newAction);
      });
      requestPayload.stepArray.push(newStep);
    });
    // fill the poperties array
    requestPayload.propArr = [];
    testcase.propertiesV2.testCaseProperties.forEach(propgroup => {
      propgroup.values.forEach(propvalue => {
        let newPropValue: any;
        newPropValue = {};
        newPropValue.property = propvalue.property;
        newPropValue.description = propvalue.description;
        newPropValue.country = [];
        // fill the countries array with only its value (string)
        propvalue.countries.forEach(invariant => {
          newPropValue.country.push(invariant.value);
        });
        newPropValue.type = propvalue.type;
        newPropValue.database = propvalue.database;
        newPropValue.value1 = propvalue.value1;
        newPropValue.value2 = propvalue.value2;
        newPropValue.length = propvalue.length;
        newPropValue.rowLimit = propvalue.rowLimit;
        newPropValue.cacheExpire = propvalue.cacheExpire;
        newPropValue.nature = propvalue.nature;
        newPropValue.retryNb = propvalue.retryNb;
        newPropValue.retryPeriod = propvalue.retryPeriod;
        newPropValue.rank = propvalue.rank;
        newPropValue.toDelete = propvalue.toDelete || false;
        requestPayload.propArr.push(newPropValue);
      });
    });

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json; charset=UTF-8'
      })
    };

    this.http.post<any>(environment.cerberus_api_url + '/UpdateTestCaseWithDependencies', requestPayload, httpOptions)
      .subscribe(rep => {
        this.notificationService.createANotification('Test case script successfully saved', NotificationStyle.Success);
        callback(rep);
      });
  }

  clearTestCase() {
    this.testcase = null;
    this.observableTestCase.next(this.testcase);
  }

  /**
   * format a list of property values to a list of property group (by name)
   * @param propertyvalues list of property values to format
  */
  groupPropertiesByName(propertyvalues: PropertyValue[]): PropertyGroup[] {
    // list of unique property names
    const propertiesNameList = new Array<string>();
    // final object that is build along the function
    const propertiesValuesByName = new Array<PropertyGroup>();
    // fill the array with unique names
    propertyvalues.forEach(propvalue => {
      if (!propertiesNameList.includes(propvalue.property)) {
        propertiesNameList.push(propvalue.property);
      }
    });
    // build the final object for each prop name
    propertiesNameList.forEach(propname => {
      const propValueByName = new PropertyGroup(propname);
      propValueByName.values = propertyvalues.filter(propvvalue => propvvalue.property === propname);
      propertiesValuesByName.push(propValueByName);
    });
    // return the property groups
    return propertiesValuesByName;
  }

  /**
   * update a single attribute of a list of test case(s)
   * @param testcaseslist selection of test case(s) to update
   * @param fieldName name of the attribute to update
   * @param newValue new value to set
   * @param callback function upon completion
   */
  testCaseMassUpdate(testcaseslist: TestCase[], fieldName: MassActionField, newValue: string, callback: (response: any) => void) {
    // instantiate the parameters object
    let FormData: string;
    FormData = '';
    // add the corresponding field type with its new value
    switch (fieldName) {
      case MassActionField.Status: {
        FormData += 'massStatus=' + encodeURIComponent(newValue);
        break;
      }
      case MassActionField.Priority: {
        FormData += 'massPriority=' + encodeURIComponent(newValue);
        break;
      }
      case MassActionField.Application: {
        FormData += 'massApplication=' + encodeURIComponent(newValue);
        break;
      }
      case MassActionField.Executor: {
        FormData += 'massExecutor=' + encodeURIComponent(newValue);
        break;
      }
    }
    // add the list of test case(s)
    testcaseslist.forEach(testcase => {
      FormData += '&test=' + testcase.test + '&testcase=' + testcase.testcase;
    });

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
      })
    };

    // post the form data
    this.http.post<any>(environment.cerberus_api_url + '/UpdateTestCaseMass', FormData, httpOptions)
      .subscribe(rep => {
        callback(rep);
      });
  }

}
