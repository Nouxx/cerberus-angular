import { Component, OnInit, Input } from '@angular/core';
import { TestService } from 'src/app/core/services/crud/test.service';
import { Property } from 'src/app/shared/model/property.model';
import { ITestCase } from 'src/app/shared/model/testcase.model';

// a property group is a group of property values by name
export class ProperyGroup {
  property: string; // name of the property values
  values: Array<Property>; // list of all properties values

  constructor(property: string) {
    this.property = property;
    this.values = [];
  }
}

@Component({
  selector: 'app-property-v3',
  templateUrl: './property-v3.component.html',
  styleUrls: ['./property-v3.component.scss']
})
export class PropertyV3Component implements OnInit {

  // unique couple (folder, id) used for querying the API
  // to refresh the properties list
  @Input('testfolder') testfolder: string;
  @Input('testcaseid') testcaseid: string;

  @Input('testcase') testcase: ITestCase; // full testcase object

  // raw list of properties (used only to store the API result)
  private propertiesList: Array<Property>;
  // property groups : properties grouped by name
  public propertyGroups: Array<ProperyGroup>;

  constructor(private testService: TestService) { }

  ngOnInit() {
    // ensure the test & testcase are defined
    if (!this.testfolder) {
      console.error('ERROR: test is not defined, please open an issue on github');
    } else if (!this.testcaseid) {
      console.error('ERROR: testcase is not defined, please open an issue on github');
    } else {
      // refresh the properties list
      this.testService.getProperties(this.testfolder, this.testcaseid);
    }

    // subscribe to any propertiesList change
    this.testService.observableTestCaseProperties.subscribe(r => {
      if (r) {
        this.propertiesList = r;
        this.groupPropertiesByName();
      }
    });
  }

  // refresh the property groups
  groupPropertiesByName(): void {
    // list of unique property names
    const propertiesNameList = new Array<string>();
    // final object that is build along the function
    const propertiesValuesByName = new Array<ProperyGroup>();
    // fill the array with unique names
    this.propertiesList.forEach(propvalue => {
      if (!propertiesNameList.includes(propvalue.property)) {
        propertiesNameList.push(propvalue.property);
      }
    });
    // build the final object for each prop name
    propertiesNameList.forEach(propname => {
      const propValueByName = new ProperyGroup(propname);
      propValueByName.values = this.propertiesList.filter(propvvalue => propvvalue.property === propname);
      propertiesValuesByName.push(propValueByName);
    });
    // save the new value
    this.propertyGroups = propertiesValuesByName;
  }

  // create a new empty property
  addAPropertyGroup(): void {
    const newPropertyGroup = new ProperyGroup(this.getLatestNewPropertyName());
    console.log(this.getLatestNewPropertyName());
    this.propertyGroups.push(newPropertyGroup);
    console.log(this.propertyGroups);
  }

  // new property group name are generated following:
  // 'NewProperty1', 'NewProperty2', ...
  // this function returns the latest  incremental name
  getLatestNewPropertyName(): string {
    // if we find a property group with a name starting with 'NewProperty'
    if (this.propertyGroups.find(propgroup => propgroup.property.startsWith('NewProperty')) !== undefined) {
      // get the content after the prefix 'NewProperty'
      const indexes = new Array<number>();
      this.propertyGroups.filter(propgroup => propgroup.property.startsWith('NewProperty')).forEach(propgroup => {
        if (!isNaN(Number(propgroup.property.substring(11)))) {
          indexes.push(Number(propgroup.property.substring(11)));
        }
      });
      const maxIndex = Math.max(...indexes);
      return 'NewProperty' + String(maxIndex + 1);
    } else {
      return 'NewProperty1';
    }

  }
}