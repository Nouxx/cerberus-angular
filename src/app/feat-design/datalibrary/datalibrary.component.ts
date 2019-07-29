import { Component, OnInit } from '@angular/core';
import { Column } from 'src/app/shared/model/column.model';
import { TestService } from 'src/app/core/services/crud/test.service';
import { InvariantsService } from 'src/app/core/services/crud/invariants.service';
import { LabelfilteringPipe } from 'src/app/shared/pipes/labelfiltering.pipe';
import { SystemService } from 'src/app/core/services/crud/system.service';
import { FilterService } from 'src/app/core/services/crud/filter.service';
import { Filter } from 'src/app/shared/model/filter.model';

@Component({
  selector: 'app-datalibrary',
  templateUrl: './datalibrary.component.html',
  styleUrls: ['./datalibrary.component.scss']
})
export class DatalibraryComponent implements OnInit {

  columns: Array<Column> = [
    {
      displayName: "ID",
      contentName: 'testDataLibID',
      active: true,
      sSearch: [],
      databaseName: 'tdl.TestDataLibID',
      searchable: true,
      param: {
        multiple: true,
        
        placeholder: 'Select ID',
    },
    },
    {
      displayName: "Name",
      contentName: 'name',
      active: true, 
      sSearch: [],
      databaseName: 'tdl.Name',
      searchable: true,
      param: {
        multiple: true,
        
        placeholder: 'Select Name',
    },
    },
    {
      displayName: "System",
      contentName: 'system',
      active: true, 
      sSearch: [],
      databaseName: 'tdl.System',
      searchable: true,
      param: {
        multiple: true,
        
        placeholder: 'Select System',
    },
    },
    {
      displayName: "Environment",
      contentName: 'environment',
      active: true, 
      sSearch: [],
      databaseName : 'tdl.Environment',
      searchable: true,
      param: {
        multiple: true,
        
        placeholder: 'Select Environment',
    },
    },
    {
      displayName: "Country",
      contentName: 'country',
      active: false, 
      sSearch: [],
      databaseName : 'tdl.Country',
      searchable: true,
      param: {
        multiple: true,
        
        placeholder: 'Select Country',
    },
    },
    {
      displayName: "Group",
      contentName: 'group',
      active: false, 
      sSearch: [],
      databaseName : 'tdl.Group',
      searchable: true,
      param: {
        multiple: true,
        
        placeholder: 'Select Group',
    },
    },
    {
      displayName: "Description",
      contentName: 'description',
      active: false, 
      sSearch: [],
      databaseName : 'tdl.Description',
      searchable: true,
      param: {
        multiple: true,
        
        placeholder: 'Select Description',
    },
    },
    {
      displayName: "Type",
      contentName: 'type',
      active: false, 
      sSearch: [],
      databaseName : 'tdl.Type',
      searchable: true,
      param: {
        multiple: true,
        
        placeholder: 'Select Type',
    },
    },
    {
      displayName: "Value",
      contentName: 'subDataValue',
      active: false, 
      sSearch: [],
      databaseName : 'tdd.value',
      searchable: true,
      param: {
        multiple: true,
        
        placeholder: 'Select Value',
    },
    },
    {
      displayName: "Database",
      contentName: 'database',
      active: false, 
      sSearch: [],
      databaseName : 'tdl.Database',
      searchable: true,
      param: {
        multiple: true,
        
        placeholder: 'Select Database',
    },
    },
    {
      displayName: "Script",
      contentName: 'script',
      active: false,
      width: 300, 
      sSearch: [],
      databaseName : 'tdl.Script',
      searchable: true,
      param: {
        multiple: true,
        
        placeholder: 'Select Script',
    },
    },
    {
      displayName: "Database",
      contentName: 'databaseUrl',
      active: false, 
      sSearch: [],
      databaseName : 'tdl.DatabaseUrl',
      searchable: true,
      param: {
        multiple: true,
        
        placeholder: 'Select Database',
    },
    },
    {
      displayName: "Service",
      contentName: 'service',
      active: false, 
      sSearch: [],
      databaseName : 'tdl.Service',
      searchable: true,
      param: {
        multiple: true,
        
        placeholder: 'Select Service',
    },
    },
    {
      displayName: "Service Path",
      contentName: 'servicePath',
      active: false, 
      sSearch: [],
      databaseName : 'tdl.ServicePath',
      searchable: true,
      param: {
        multiple: true,
        
        placeholder: 'Select Service Path',
    },
    },
    {
      displayName: "Operation",
      contentName: 'method',
      active: false, 
      sSearch: [],
      databaseName : 'tdl.method',
      searchable: true,
      param: {
        multiple: true,
        
        placeholder: 'Select Operation',
    },
    },
    {
      displayName: "Envelope",
      contentName: 'envelope',
      active: false, 
      sSearch: [],
      databaseName : 'tdl.envelope',
      searchable: true,
      param: {
        multiple: true,
        
        placeholder: 'Select Envelope',
    },
    },
    {
      displayName: "Database CSV",
      contentName: 'tdl.databaseCsv',
      active: false, 
      sSearch: [],
      databaseName : 'DatabaseCsv',
      searchable: true,
      param: {
        multiple: true,
        
        placeholder: 'Select Database CSV',
    },
    },
    {
      displayName: "C SV URL",
      contentName: 'csvUrl',
      active: false, 
      sSearch: [],
      databaseName : 'tdl.csvUrl',
      searchable: true,
      param: {
        multiple: true,
        
        placeholder: 'Select C SV URL',
    },
    },
    {
      displayName: "Separator",
      contentName: 'separator',
      active: false, 
      sSearch: [],
      databaseName : 'tdl.separator',
      searchable: true,
      param: {
        multiple: true,
        
        placeholder: 'Select Separator',
    },
    },
    {
      displayName: "Creation Date",
      contentName: 'created',
      active: false, 
      sSearch: [],
      databaseName : 'tdl.Created',
      searchable: true,
      param: {
        multiple: true,
        
        placeholder: 'Select Creation Date',
    },
    },
    {
      displayName: "Creator",
      contentName: 'creator',
      active: false, 
      sSearch: [],
      databaseName : 'tdl.Creator',
      searchable: true,
      param: {
        multiple: true,
        
        placeholder: 'Select Creator',
    },
    },
    {
      displayName: "Modification Date",
      contentName: 'lastModified',
      active: false, 
      sSearch: [],
      databaseName : 'tdl.LastModified',
      searchable: true,
      param: {
        multiple: true,
        
        placeholder: 'Select Modification Date',
    },
    },
    {
      displayName: "Last Modifier",
      contentName: 'lastModifier',
      active: false, 
      sSearch: [],
      databaseName : 'tdl.LastModifier',
      searchable: true,
      param: {
        multiple: true,
        
        placeholder: 'Select Last Modifier',
    },
    },
    {
      displayName: "Column",
      contentName: 'subDataColumn',
      active: false, 
      sSearch: [],
      databaseName : 'tdd.column',
      searchable: true,
      param: {
        multiple: true,
        
        placeholder: 'Select Column',
    },
    },
    {
      displayName: "Parsing Answer",
      contentName: 'subDataParsingAnswer',
      active: false, 
      sSearch: [],
      databaseName : 'tdd.ParsingAnswer',
      searchable: true,
      param: {
        multiple: true,
        
        placeholder: 'Select Parsing Answer',
    },
    },
    {
      displayName: "Column Position",
      contentName: 'subDataColumnPosition',
      active: false, 
      sSearch: [],
      databaseName : 'tdd.ColumnPosition',
      searchable: true,
      param: {
        multiple: true,
        
        placeholder: 'Select Column Position',
    },
    }
  ];
  page = {
    size: 10, //maximum element per page
    number: 1, //number of current page
    sort: [{ dir: "asc", prop: "testDataLibID" }], //sort item
    totalCount: 0 //total count of element in database
  };
  rows = [];
  selectedRows = [];
  filterList: Array<Filter> = [];
  globalSearch = ''; // value in global search field
  filterTest: any; //
  servlet = '/ReadTestDataLib';

  constructor(private testService: TestService, private invariantsService: InvariantsService, private labelfilteringPipe: LabelfilteringPipe, private systemService: SystemService, private filterService: FilterService) { }

  ngOnInit() { }

}
