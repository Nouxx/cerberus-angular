import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { TestcaseService } from 'src/app/core/services/api/testcase/testcase.service';
import { TestCaseHeader } from 'src/app/shared/model/back/testcase.model';
import { TestFolder } from 'src/app/shared/model/back/test.model';
import { IInvariant } from 'src/app/shared/model/invariants.model';
import { InvariantsService } from 'src/app/core/services/api/invariants.service';
import { Label } from 'src/app/shared/model/back/label.model';
import { SystemService } from 'src/app/core/services/api/system.service';
import { IBuildRevisionInvariant } from 'src/app/shared/model/buildrevisioninvariant.model';
import { IApplication } from 'src/app/shared/model/application.model';
import { IProject } from 'src/app/shared/model/project.model';
import { TestService } from 'src/app/core/services/api/test/test.service';
// JS Functions
declare function blockAPI(mode, id): void;

@Component({
  selector: 'app-tc-header',
  templateUrl: './tc-header.component.html',
  styleUrls: ['./tc-header.component.scss']
})
export class TcHeaderComponent implements OnInit, OnChanges {

  @Input('test') selectedTest: string;
  @Input('testcase') selectedTestCase: string;

  @Input('testcaseheader') testcaseheader: TestCaseHeader;
  private testcaseheader_countryList: any;
  private testcaseheader_countryList_custom: Array<string> = new Array<string>();
  private testcaseheader_labelsList: Array<Label>;
  private originalTest: string;
  private originalTestCase: string;

  public block_id: string;

  public testsList: Array<TestFolder> = new Array<TestFolder>();
  private testcasesList: Array<TestCaseHeader> = new Array<TestCaseHeader>();

  public tabs: string[] = ['Definition', 'Execution', 'Label', 'Origin', 'Bug Report', 'Tracability'];
  public selectedTab: string;

  private labels_tabs: string[] = ['Stickers', 'Requirements', 'Batteries'];
  private selectedLabelsTab: string;

  // labels
  private labelsList: Array<Label>;
  private stickersList: Array<Label>;
  private requirementsList: Array<Label>;
  private batteriesList: Array<Label>;
  // projects
  private projectsList: Array<IProject>;
  // applications List
  private applicationsList: Array<IApplication>;
  private application: IApplication;
  // build revision invariants
  private sprints: Array<IBuildRevisionInvariant>;
  private isThereAnySprintDefined: boolean;
  private revs: Array<IBuildRevisionInvariant>;
  private isThereAnyRevDefined: boolean;
  // public invariants
  private inv_tcstatus: Array<IInvariant>;
  private inv_priorities: Array<IInvariant>;
  private inv_countries: Array<IInvariant>;
  private inv_originsList: Array<IInvariant>;
  // private invariants
  private inv_group: Array<IInvariant>;
  private inv_condition_oper: Array<IInvariant>;

  constructor(
    private testcaseService: TestcaseService,
    private testService: TestService,
    private InvariantService: InvariantsService,
    private systemService: SystemService
  ) { }

  ngOnChanges() {
    if (this.testcaseheader) {
      // DIRTY
      this.testcaseheader_countryList_custom = new Array<string>();
      for (const country in this.testcaseheader.countryList) {
        if (country) {
          this.testcaseheader_countryList_custom.push(country);
        }
      }
      this.originalTest = this.testcaseheader.test;
      this.originalTestCase = this.testcaseheader.testCase;
    }
  }

  ngOnInit() {
    this.block_id = 'testcaseheader_block';
    if (this.testcaseService.refreshTC) {
      blockAPI('state_loading', this.block_id);
      const loadingAnimationTime = setInterval(() => {
        this.testcaseService.refreshTC = false;
        blockAPI('state_normal', this.block_id);
        clearInterval(loadingAnimationTime);
      }, 1000);
    } else {
      blockAPI('content_hide', this.block_id);
    }
    this.testService.observableTestsList.subscribe(response => { this.testsList = response; });
    this.testcaseService.observableTestCasesList.subscribe(response => { this.testcasesList = response; });
    this.testcaseService.observableTestCaseLabels.subscribe(response => { this.testcaseheader_labelsList = response; });
    this.testcaseService.observableProjectsList.subscribe(response => { this.projectsList = response; });
    this.InvariantService.observableCountriesList.subscribe(response => { this.inv_countries = response; });
    this.InvariantService.observableTcStatus.subscribe(response => { this.inv_tcstatus = response; });
    this.InvariantService.observableGroupsList.subscribe(response => { this.inv_group = response; });
    this.InvariantService.observablePriorities.subscribe(response => { this.inv_priorities = response; });
    this.InvariantService.observableOriginsList.subscribe(response => { this.inv_originsList = response; });
    this.InvariantService.observableConditionOperList.subscribe(response => { this.inv_condition_oper = response; });
    this.systemService.observableApplicationList.subscribe(response => { this.applicationsList = response; });
    this.systemService.observableApplication.subscribe(response => { this.application = response; });
    this.systemService.observableLabelsList.subscribe(response => {
      this.labelsList = response;
      if (this.labelsList) {
        this.stickersList = this.systemService.filterLabels(this.labelsList, 'STICKER');
        this.requirementsList = this.systemService.filterLabels(this.labelsList, 'REQUIREMENT');
        this.batteriesList = this.systemService.filterLabels(this.labelsList, 'BATTERY');
      }
    });
    this.systemService.observableSprints.subscribe(response => {
      if (response) {
        this.sprints = response;
        if (response.length > 0) {
          this.isThereAnySprintDefined = true;
        } else {
          this.isThereAnySprintDefined = false;
        }
      }
    });
    this.systemService.observableRevs.subscribe(response => {
      if (response) {
        this.revs = response;
        if (response.length > 0) {
          this.isThereAnyRevDefined = true;
        } else {
          this.isThereAnyRevDefined = false;
        }
      }
    });
    // set the default openened tab
    this.selectedTab = this.tabs[0];
    this.selectedLabelsTab = this.labels_tabs[0];
  }

  refreshTestCase() {
    this.testService.getTestFoldersList();
    this.testcaseService.getTestCase(this.selectedTest, this.selectedTestCase);
    this.systemService.getLabelsFromSystem(this.testcaseheader.system);
    this.systemService.getRevFromSystem(this.testcaseheader.system);
    this.systemService.getSprintsFromSystem(this.testcaseheader.system);
    this.systemService.getApplication(this.testcaseheader.application);
    this.testcaseService.getProjectsList();
    this.InvariantService.getCountriesList();
    this.InvariantService.getTcStatus();
    this.InvariantService.getOriginsList();
    this.InvariantService.getPriorities();
    this.InvariantService.getGroupList();
    this.InvariantService.getOriginsList();
    this.InvariantService.getStepConditionOperList();
    this.systemService.getApplicationList();
    this.testcaseService.refreshTC = true;
  }

  // DIRTY : the model should be an array of string, not a JSON object with {"FR": FR}
  updateCheckedCountries(country) {
    const index = this.testcaseheader_countryList_custom.indexOf(country.value);
    if (index >= 0) {
      // remove it
      this.testcaseheader_countryList_custom.splice(index, 1);
    } else {
      // add it
      this.testcaseheader_countryList_custom.push(country);
    }
  }

  addLabelToTestCase(label: Label) {
    if (!this.isLabelPresentinTestCase(label.id)) {
      this.testcaseheader_labelsList.push(label);
    }
  }

  removeLabelFromTestCase(labelid: number) {
    if (this.isLabelPresentinTestCase(labelid)) {
      const label = this.testcaseheader_labelsList.find(x => x.id === labelid);
      const index = this.testcaseheader_labelsList.indexOf(label);
      this.testcaseheader_labelsList.splice(index, 1);
    }
  }

  isLabelPresentinTestCase(labelid: number) {
    return this.testcaseheader_labelsList.some(x => x.id = labelid);
  }

  redirectToBugID(): void {
    if (this.testcaseheader.bugID != null) { window.open(this.application.bugTrackerNewUrl, '_blank'); }
  }

  saveTestCaseHeader() {
    this.testcaseheader_countryList = {};
    for (const index in this.testcaseheader_countryList_custom) {
      if (index) {
        const country = this.testcaseheader_countryList_custom[index];
        Object.assign(this.testcaseheader_countryList, { [country]: country });
      }
    }
    this.testcaseheader.countryList = this.testcaseheader_countryList;
    this.testcaseService.saveTestCaseHeader(this.testcaseheader, this.originalTest, this.originalTestCase);
  }

  debug() { }

}
