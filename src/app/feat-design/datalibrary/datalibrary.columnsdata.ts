import { Column, FILTER_MODE } from 'src/app/shared/model/front/column.model';

export const DataLibColumnsData: Column[] = [
  {
    displayName: 'ID',
    contentName: 'testDataLibID',
    active: false,
    defaultActive: false,
    sSearch: [],
    apiName: 'tdl.TestDataLibID',
    filterMode: FILTER_MODE.SEARCH_FIELD,
    filterable: true,
    flexGrow: 50,
    multiple: true,
    placeholder: 'Select ID',
  },
  {
    displayName: 'Name',
    contentName: 'name',
    active: true,
    defaultActive: true,
    sSearch: [],
    apiName: 'tdl.Name',
    filterMode: FILTER_MODE.SEARCH_FIELD,
    filterable: true,
    multiple: true,
    placeholder: 'Select Name',
  },
  {
    displayName: 'Type',
    contentName: 'type',
    active: true,
    defaultActive: true,
    sSearch: [],
    apiName: 'tdl.Type',
    filterable: true,
    multiple: true,
    placeholder: 'Select Type',
  },
  {
    displayName: 'Description',
    contentName: 'description',
    active: true,
    defaultActive: true,
    sSearch: [],
    flexGrow: 250,
    apiName: 'tdl.Description',
    filterable: true,
    multiple: true,
    placeholder: 'Select Description',
  },
  {
    displayName: 'System',
    contentName: 'system',
    active: true,
    defaultActive: true,
    sSearch: [],
    apiName: 'tdl.System',
    filterable: true,
    multiple: true,
    placeholder: 'Select System',
  },
  {
    displayName: 'Environment',
    contentName: 'environment',
    active: true,
    defaultActive: true,
    sSearch: [],
    flexGrow: 80,
    apiName: 'tdl.Environment',
    filterable: true,
    multiple: true,
    placeholder: 'Select Environment',
  },
  {
    displayName: 'Country',
    contentName: 'country',
    active: true,
    defaultActive: true,
    sSearch: [],
    apiName: 'tdl.Country',
    filterable: true,
    multiple: true,
    placeholder: 'Select Country',
  },
  {
    displayName: 'Group',
    contentName: 'group',
    active: false,
    sSearch: [],
    apiName: 'tdl.Group',
    filterable: true,
    multiple: true,
    placeholder: 'Select Group',
  },
  {
    displayName: 'Value',
    contentName: 'subDataValue',
    active: false,
    sSearch: [],
    apiName: 'tdd.value',
    filterMode: FILTER_MODE.SEARCH_FIELD,
    filterable: true,
    multiple: true,
    placeholder: 'Select Value',
  },
  {
    displayName: 'Database',
    contentName: 'database',
    active: false,
    sSearch: [],
    apiName: 'tdl.Database',
    filterable: true,
    multiple: true,
    placeholder: 'Select Database',
  },
  {
    displayName: 'Script',
    contentName: 'script',
    active: false,
    sSearch: [],
    flexGrow: 300,
    apiName: 'tdl.Script',
    multiple: true,
    placeholder: 'Select Script',
  },
  {
    displayName: 'Database',
    contentName: 'databaseUrl',
    active: false,
    sSearch: [],
    apiName: 'tdl.DatabaseUrl',
    filterable: true,
    multiple: true,
    placeholder: 'Select Database',
  },
  {
    displayName: 'Service',
    contentName: 'service',
    active: false,
    sSearch: [],
    apiName: 'tdl.Service',
    filterable: true,
    multiple: true,
    placeholder: 'Select Service',
  },
  {
    displayName: 'Service Path',
    contentName: 'servicePath',
    active: false,
    sSearch: [],
    apiName: 'tdl.ServicePath',
    filterable: true,
    multiple: true,
    placeholder: 'Select Service Path',
  },
  {
    displayName: 'Operation',
    contentName: 'method',
    active: false,
    sSearch: [],
    apiName: 'tdl.method',
    filterable: true,
    multiple: true,
    placeholder: 'Select Operation',
  },
  {
    displayName: 'Envelope',
    contentName: 'envelope',
    active: false,
    sSearch: [],
    apiName: 'tdl.envelope',
    filterable: true,
    multiple: true,
    placeholder: 'Select Envelope',
  },
  {
    displayName: 'Database CSV',
    contentName: 'tdl.databaseCsv',
    active: false,
    sSearch: [],
    apiName: 'DatabaseCsv',
    filterable: true,
    multiple: true,
    placeholder: 'Select Database CSV',
  },
  {
    displayName: 'C SV URL',
    contentName: 'csvUrl',
    active: false,
    sSearch: [],
    apiName: 'tdl.csvUrl',
    filterable: true,
    multiple: true,
    placeholder: 'Select C SV URL',
  },
  {
    displayName: 'Separator',
    contentName: 'separator',
    active: false,
    sSearch: [],
    apiName: 'tdl.separator',
    filterable: true,
    multiple: true,
    placeholder: 'Select Separator',
  },
  {
    displayName: 'Creation Date',
    contentName: 'created',
    active: false,
    sSearch: [],
    apiName: 'tdl.Created',
    filterable: true,
    multiple: true,
    placeholder: 'Select Creation Date',
  },
  {
    displayName: 'Creator',
    contentName: 'creator',
    active: false,
    sSearch: [],
    apiName: 'tdl.Creator',
    filterable: true,
    multiple: true,
    placeholder: 'Select Creator',
  },
  {
    displayName: 'Modification Date',
    contentName: 'lastModified',
    active: false,
    sSearch: [],
    apiName: 'tdl.LastModified',
    filterable: true,
    multiple: true,
    placeholder: 'Select Modification Date',
  },
  {
    displayName: 'Last Modifier',
    contentName: 'lastModifier',
    active: false,
    sSearch: [],
    apiName: 'tdl.LastModifier',
    filterable: true,
    multiple: true,
    placeholder: 'Select Last Modifier',
  },
  {
    displayName: 'Column',
    contentName: 'subDataColumn',
    active: false,
    sSearch: [],
    apiName: 'tdd.column',
    filterable: true,
    multiple: true,
    placeholder: 'Select Column',
  },
  {
    displayName: 'Parsing Answer',
    contentName: 'subDataParsingAnswer',
    active: false,
    sSearch: [],
    apiName: 'tdd.ParsingAnswer',
    filterable: true,
    multiple: true,
    placeholder: 'Select Parsing Answer',
  },
  {
    displayName: 'Column Position',
    contentName: 'subDataColumnPosition',
    active: false,
    sSearch: [],
    apiName: 'tdd.ColumnPosition',
    filterable: true,
    multiple: true,
    placeholder: 'Select Column Position',
  }
];
