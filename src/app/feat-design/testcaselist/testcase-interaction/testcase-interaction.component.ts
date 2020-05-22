import { Component, OnInit } from '@angular/core';
import { TestCase } from 'src/app/shared/model/back/testcase/testcase.model';
import { InvariantsService } from 'src/app/core/services/api/invariants.service';
import { SystemService } from 'src/app/core/services/api/system.service';
import { TestcaseService } from 'src/app/core/services/api/testcase/testcase.service';
import { TestFolder } from 'src/app/shared/model/back/testfolder/test.model';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { NotificationService } from 'src/app/core/services/utils/notification.service';
import { NotificationStyle } from 'src/app/core/services/utils/notification.model';
import { SidecontentService, INTERACTION_MODE } from 'src/app/core/services/api/sidecontent.service';
import { Invariant } from 'src/app/shared/model/back/invariant/invariant.model';
import { TestService } from 'src/app/core/services/api/test/test.service';

@Component({
  selector: 'app-testcase-interaction',
  templateUrl: './testcase-interaction.component.html',
  styleUrls: ['./testcase-interaction.component.scss']
})
export class TestcaseInteractionComponent implements OnInit {

  /** variables received from the addComponentToSideBlock method */
  // from testcaselist.component.ts
  private test: string;
  private testcase: string;
  private application: string;
  // mode to interact with the test case header
  private mode: INTERACTION_MODE;
  // tabs currently active (used to set the active tab)
  private selectedTab: string;

  // testcase header object (can be refreshed by test and test folder variables)
  private testcaseheader: TestCase;

  // list of tabs
  private tabs: Array<string>;

  // new test case ID when test folder has changed
  private newTestCase: string;

  // form that is submitted to to the API
  public testcaseHeaderForm: FormGroup;

  // title for save button (different according to the mode)
  private saveButtonTitle: string;

  // tests folder list used for Test & Test case folder section
  private testfolders: Array<TestFolder>;

  /** list of available countries to select */
  public countries: Array<Invariant>;

  // ???
  exit: (n: void) => void;

  constructor(
    private invariantsService: InvariantsService,
    private systemService: SystemService,
    private formBuilder: FormBuilder,
    private testcaseService: TestcaseService,
    private testService: TestService,
    private notificationService: NotificationService,
    private sidecontentService: SidecontentService) {
    this.selectedTab = null;
    // list of tabs
    this.tabs = ['Definition', 'Settings', 'Labels', 'Bugs', 'Dependencies', 'Audit'];
    this.testcaseheader = undefined;
  }

  ngOnInit() {

    // refresh the test folders list (done only once)
    this.testService.getTestFolders((testfolders: TestFolder[]) => { this.testfolders = testfolders; });

    this.invariantsService.observableCountriesList.subscribe(rep => this.countries = rep);

    // set the correct title for the save button (depending on the mode)
    this.saveButtonTitle = this.sidecontentService.getsaveButtonTitle(this.mode);

    // if we haven't received any selected tab, set it to its default value
    if (this.selectedTab === null) {
      this.selectedTab = this.tabs[0];
    }

    this.refreshOthers();

    // creation mode
    if (this.mode === INTERACTION_MODE.CREATE) {
      // the test case header object is expected
      if (this.testcaseheader) {
        // create a new test case header object
        const newTestCaseHeader = new TestCase(
          this.testcaseheader.test,
          this.testcaseheader.testCase,
          this.testcaseheader.application,
          this.testcaseheader.type,
          this.testcaseheader.priority,
          this.testcaseheader.status,
          this.testcaseheader.countries,
          this.testcaseheader.system
        );
        this.testcaseheader = newTestCaseHeader;
        // refresh the datas that couldn't be refresh without the test case header information
        this.refreshData(this.testcaseheader);
        // instantiate the form with the correct value
        this.setFormValues();
        // set the correct test case id
        this.refreshNewTestCase();
      } else {
        // throw an error if the test case header variable is not defined
        console.error('test case header object not found, please open an issue in github : https://github.com/cerberustesting/cerberus-angular/issues/new?assignees=&labels=bug&template=bug_report.md');
      }
    } else {
      // edit, delete or duplicate mode
      // test folder name and test case id are expected
      if (this.test && this.testcase) {
        // get the test case object from API
        this.testcaseService.getTestCaseHeader(this.test, this.testcase, (testcase => {
          this.testcaseheader = testcase;
          // refresh the datas that couldn't be refresh without the test case header information
          this.refreshData(this.testcaseheader);
          // instantiate the form with the correct value
          this.setFormValues();
          // if test case is in duplicate mode
          if (this.mode === INTERACTION_MODE.DUPLICATE) {
            // we set the correct test case id
            this.refreshNewTestCase();
          }
        }));
      } else {
        console.error('test folder and test case not found, please open an issue in github : https://github.com/cerberustesting/cerberus-angular/issues/new?assignees=&labels=bug&template=bug_report.md');
      }
    }
  }

  /** transform 'Y' or 'N' string to boolean */
  toBoolean(raw: string): boolean {
    if (raw === 'Y') {
      return true;
    } else {
      return false;
    }
  }

  /** transform boolean to 'Y' or 'N' string  */
  toCerberusString(raw: boolean): string {
    if (raw === true) {
      return 'Y';
    } else {
      return 'N';
    }
  }

  /** set the form values with the testcaseheader one
   * we're converting 'Y' and 'N' field to boolean since it is mandatory for fromControlName
  */
  setFormValues() {

    // countries, labels, bugs and dependencies are handled appart from the form
    this.testcaseHeaderForm = this.formBuilder.group({
      originalTest: this.testcaseheader.test,
      originalTestCase: this.testcaseheader.testCase,
      test: new FormControl(this.testcaseheader.test),
      testCase: new FormControl(this.testcaseheader.testCase),
      definition: this.formBuilder.group({
        description: new FormControl(this.testcaseheader.description),
        application: new FormControl(this.testcaseheader.application),
        status: new FormControl(this.testcaseheader.status),
        type: new FormControl(this.testcaseheader.type),
        priority: new FormControl(this.testcaseheader.priority),
        behaviorOrValueExpected: new FormControl(this.testcaseheader.behaviorOrValueExpected)
      }),
      settings: this.formBuilder.group({
        isActive: new FormControl(this.testcaseheader.isActive),
        isActivePROD: new FormControl(this.testcaseheader.isActivePROD),
        isActiveUAT: new FormControl(this.testcaseheader.isActiveUAT),
        isActiveQA: new FormControl(this.testcaseheader.isActiveQA),
        fromMinor: new FormControl(this.testcaseheader.fromMinor),
        fromMajor: new FormControl(this.testcaseheader.fromMajor),
        toMinor: new FormControl(this.testcaseheader.toMinor),
        toMajor: new FormControl(this.testcaseheader.toMajor),
        targetMinor: new FormControl(this.testcaseheader.targetMinor),
        targetMajor: new FormControl(this.testcaseheader.targetMajor),
        conditionOperator: new FormControl(this.testcaseheader.conditionOperator),
        conditionVal1: new FormControl(this.testcaseheader.conditionVal1),
        conditionVal2: new FormControl(this.testcaseheader.conditionVal2),
        conditionVal3: new FormControl(this.testcaseheader.conditionVal3),
        userAgent: new FormControl(this.testcaseheader.userAgent),
        screenSize: new FormControl(this.testcaseheader.screenSize)
      }),
      bugsReport: this.formBuilder.group({
        comment: new FormControl(this.testcaseheader.comment)
      }),
      audit: this.formBuilder.group({
        implementer: new FormControl(this.testcaseheader.implementer),
        executor: new FormControl(this.testcaseheader.executor)
      })
    });
  }

  /**
   * used if the user change the test folder selection to refresh the test case id
  */
  refreshNewTestCase(): any {
    // get the new selected test folder (from the form)
    const newTest = this.testcaseHeaderForm.get('test').value;
    // fetch the test cases list for that test folder
    this.testcaseService.getTestCases((tcList: TestCase[]) => {
      // find the last unused test case id
      this.newTestCase = this.testcaseService.getLatestTestCaseId(tcList, newTest);
      // edit the test case form value
      this.testcaseHeaderForm.controls['testCase'].setValue(this.newTestCase);
    }, newTest);
  }

  /** refresh data that depends on a testcaseheader  */
  refreshData(testcaseheader: TestCase) {
    this.systemService.getSprintsFromSystem(testcaseheader.system);
    this.systemService.getRevFromSystem(testcaseheader.system);
    this.systemService.getLabelsHierarchyFromSystem(testcaseheader.system, testcaseheader.test, testcaseheader.testCase);
  }

  /** refresh data */
  refreshOthers() {
    this.systemService.getApplicationList();
  }

  // submit the new tc object to the API
  onSubmit(values: any): void {

    // "values" variables corresponds to the form values

    // if no application is set
    if (!values.definition.application) {
      this.notificationService.createANotification('Please specify the name of the application', NotificationStyle.Warning);
      return;
    }

    // if no test folder is set
    if (!values.test) {
      this.notificationService.createANotification('Please specify the Test Folder', NotificationStyle.Warning);
      return;
    }

    // if no test case id is set
    if (!values.testCase) {
      this.notificationService.createANotification('Please specify the Test Case ID', NotificationStyle.Warning);
      return;
    }

    // query string that will contains all the values
    let queryString = '';

    // add (& encode) all the items from the form group (one to one relationship)
    // list of values to consider as a sub form
    const formGroupsList = ['definition', 'settings', 'bugsReport', 'audit'];
    // list of key to convert from boolean to string
    const CerberusStringList = ['active', 'activeQA', 'activeUAT', 'activePROD'];
    for (const key in values) {
      // if the current node is a form group
      if (formGroupsList.includes(key)) {
        // loop in it
        for (const key2 in values[key]) {
          if (key2) {
            if (CerberusStringList.includes(key2)) {
              // convert the correct key in Y or N string (from boolean)
              queryString += encodeURIComponent(key2) + '=' + encodeURIComponent(this.toCerberusString(values[key][key2]) || '') + '&';
            } else {
              queryString += encodeURIComponent(key2) + '=' + encodeURIComponent(values[key][key2] || '') + '&';
            }

          }
        }
      } else { queryString += encodeURIComponent(key) + '=' + encodeURIComponent(values[key] || '') + '&'; }
    }

    // add all the countries
    // format is [{"country":"FR","toDelete":false},{"country":"BE","toDelete":false}...]
    const countriesQS = new Array<any>();
    this.countries.forEach(country => {
      const formattedCountry = {
        country: country.value,
        toDelete: this.testcaseService.isCountryDefinedForTestCase(this.testcaseheader.countries, country.value)
      };
      countriesQS.push(formattedCountry);
    });
    queryString += 'countryList=' + encodeURIComponent(JSON.stringify(countriesQS)) + '&';

    // add all the labels
    // format is [{"labedId":"2","toDelete":false},{"labedId":"PT","toDelete":false}...]
    // it seems to be always false
    const labelsQS = new Array<any>();
    this.testcaseheader.labels.forEach(label => {
      const formattedLabel = {
        labelId: label.id,
        toDelete: false
      };
      labelsQS.push(formattedLabel);
    });
    queryString += 'labelList=' + encodeURIComponent(JSON.stringify(labelsQS)) + '&';

    // add all the dependencies
    // format is [{"id":"15","test":"benoit","testcase":"0001A","description":"","active":true}]
    const dependenciesQS = new Array<any>();
    this.testcaseheader.dependencies.forEach(dependency => {
      const formattedDependency = {
        id: dependency.id,
        test: dependency.test,
        testcase: dependency.testCase,
        description: dependency.description,
        active: dependency.active
      };
      dependenciesQS.push(formattedDependency);
    });
    queryString += 'testcaseDependency=' + encodeURIComponent(JSON.stringify(dependenciesQS)) + '&';

    // add all the bugs
    // format is [{"id":"BUGID1","desc":"klnkjn","act":true,"dateCreated":"2020-03-05T20:56:09.036Z","dateClosed":"1970-01-01T00:00:00.000Z"},
    // {"id":"BUGID2","desc":"jjj","act":true,"dateCreated":"2020-03-05T20:56:14.323Z","dateClosed":"1970-01-01T00:00:00.000Z"}]
    const bugsQS = new Array<any>();
    this.testcaseheader.bugs.forEach(bug => {
      const formattedBug = {
        id: bug.id,
        desc: bug.desc,
        act: bug.act
        // TODO: add the dates
      };
      bugsQS.push(formattedBug);
    });
    queryString += 'bugId=' + encodeURIComponent(JSON.stringify(bugsQS)) + '&';

    // trigger the correct API endpoint
    if (this.mode === INTERACTION_MODE.CREATE) {
      this.testcaseService.createTestCase(queryString).subscribe(rep => this.refreshTable());
    } else {
      this.testcaseService.updateTestCase(queryString).subscribe(rep => this.refreshTable());
    }
  }

  // ??
  refreshTable(): void {
    this.sidecontentService.closeSideBlock();
    this.exit();
  }

  // cancel the current interaction and close the side content
  closeSideContent() {
    this.sidecontentService.closeSideBlock();
  }
}
