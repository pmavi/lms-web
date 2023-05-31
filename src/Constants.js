// Dates displayed to the user or to match the DB format.
export const DATE_FORMAT_KEYBOARD = 'MM/DD/YYYY';
export const MONTH_FORMAT = 'MM/YYYY';
export const MONTH_ONLY_FORMAT = 'MMM';
export const YEAR_FORMAT = 'YYYY';
export const DATE_TIME_FORMAT = 'M/D/YYYY hh:mm a';
export const DATE_MEDIUM_FORMAT = 'MMM D, YYYY hh:mm a';
export const DATE_DB_FORMAT = 'YYYY-MM-DD';
export const CURRENCY_FORMAT = '$#,###,###,##0.';
export const CURRENCY_FULL_FORMAT = '$#,###,###,##0.00';
export const CURRENCY_FULL_EXCEL = '"$"#,##0.00';
export const PERCENT_FORMAT = '##0.00%';
export const DAYS_TO_DISPLAY_COMPLETED_TASKS = 7;

export const MONTHS = [
   'January',
   'February',
   'March',
   'April',
   'May',
   'June',
   'July',
   'August',
   'September',
   'October',
   'November',
   'December',
   'Annual',
];

export const MONTHS_CONVERT = {
   jan: 'January',
   feb: 'February',
   mar: 'March',
   apr: 'April',
   may: 'May',
   jun: 'June',
   jul: 'July',
   aug: 'August',
   sep: 'September',
   oct: 'October',
   nov: 'November',
   dec: 'December',
   annual: 'Annual',
};

export const ERROR_COLOR = '#AA0B06';
export const WARNING_COLOR = '#F5CD19';
export const SUCCESS_COLOR = '#5C9E52';
export const PRIMARY_COLOR = 'rgb(107,146,65)';

export const LOCK_ICON = '/images/lock.png';
export const LOGO_MEDIUM = '/images/logo.png';
export const LOGO_LARGE = '/images/logo-large.webp';
export const LOGO_LARGEST = '/images/Farmer_metrics_logo_v1.png';
export const LOGO = LOGO_LARGE;
export const METRICS_LOGO = '/images/Farmer_metrics_logo_v1.png';
export const SMALL_LOGO = '/images/LF Shield Logo_Light_H_300ppi.png';

export const ENDPOINT = !process.env.REACT_APP_ENDPOINT
   ? '/api/graphql/'
   : `http://${process.env.REACT_APP_ENDPOINT}/api/graphql/`;
console.log('Endpoint = ', ENDPOINT);
console.log('Version = ', process.env.REACT_APP_VERSION);

export const APPBAR_HEIGHT = 70;
export const APPBAR_SMALL_HEIGHT = 60;
export const DRAWER_WIDTH = 210;
export const EDIT_DRAWER_WIDTH = 300;
export const CONTRACT_EDIT_DRAWER_WIDTH = 380;
export const ADMIN_DRAWER = 300;
export const FOLDERS_DRAWER = 314;

export const SPACING_DEFAULT_PDF = 4;

// File upload
export const FILE_MIME_TYPES = [
   'text/plain',
   'text/csv',
   'application/pdf',
   'application/vnd.ms-excel',
   'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];
export const BUCKET_NAME = 'legacy-farmer-test-temp-public';
// export const FILE_BUCKET =
//    process.env.NODE_ENV !== 'production' ? 'legacy-farmer-test-users' : 'legacy-farmer-prod-users';
export const FILE_BUCKET =
   process.env.REACT_APP_POOL === 'production' ? 'legacy-farmer-prod-users' : 'legacy-farmer-test-users';
export const UNDO_DURATION = 8000;
export const ROOT_ID = 'root';
export const PASSIVE_ROOT_ID = 'passiveRoot';
export const ACTIVE_ROOT_ID = 'activeRoot';

export const DIRECTORY_FILE_NAME = '...';

export const DEPRECIATION_TYPE_NAME = 'Depreciation';

export const DEFAULT_MONTH_ORDER = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

// Roles
export const ADMIN_GROUP = 'Admin';

// Edit Constants
export const CLIENT_EDIT = 'Client';
export const ENTITY_EDIT = 'Entity';
export const USER_EDIT = 'User';
export const TASK_EDIT = 'Task';
export const ASSET_EDIT = 'Asset';
export const LIABILITY_EDIT = 'Liability';
export const SEAT_EDIT = 'SeatEdit';
export const FOLDER_EDIT = 'FolderEdit';
export const CONTRACT_EDIT = 'Contract';

// Indexes for pdf and excel export
export const ACCOUNTABILITY_CHART_INDEX = 0;
export const LOAN_ANALYSIS_INDEX = 1;
export const ASSET_INDEX = 2;
export const LIABILITY_INDEX = 3;
export const BALANCE_SHEET_INDEX = 4;
export const CASH_FLOW_INDEX = 5;
export const CONTRACTS_INDEX = 6;
export const TAXABLE_INCOME_INDEX = 7;
export const PDF_COUNT = TAXABLE_INCOME_INDEX + 1;

//Paths
export const DEFAULT_PATH = '/';
export const ADMIN_PATH = '/admin';
export const ADMIN_SETUP_PATH = '/admin/:clientId?';
export const CLIENT_DASHBOARD_PATH = '/client/:clientId';
export const CLIENT_ENTITY_DASHBOARD_PATH = '/client/:clientId/entity/:entityId';
export const ACCOUNTABILITY_CLIENT_ENTITY_PATH = '/client/:clientId/entity/:entityId/accountability';
export const CLIENT_ENTITY_PATH = '/client/:clientId/entity/:entityEditId?';
export const ENTITY_ASSET_PATH = '/client/:clientId/entity/:entityId/asset';
export const LIABILITIES_PATH = '/client/:clientId/entity/:entityId/liability';
export const CONTRACT_PATH = '/client/:clientId/entity/:entityId/contract';

//lms
export const LMS_DASHBOARD_PATH = '/client/:clientId/course/:courseId/:unitId';
export const LMS_UNIT_PATH = '/client/:clientId/course/:courseId';
export const LMS_SEARCH_PATH = '/client/:clientId/search/:searchParams?';
//lms end

export const LOAN_ANALYSIS_PATH = '/client/:clientId/entity/:entityId/loanAnalysis';
// export const LOAN_ANALYSIS_PATH = '/client/:clientId/entity/:entityId/loanAnalysis/:mode?';
export const BALANCE_SHEET_PATH = '/client/:clientId/entity/:entityId/balanceSheet';
// export const BALANCE_SHEET_PATH = '/client/:clientId/entity/:entityId/balanceSheet/:mode?';
export const CASH_FLOW_PATH = '/client/:clientId/entity/:entityId/cashFlow';
export const TAXABLE_INCOME_PATH = '/client/:clientId/entity/:entityId/taxableIncome';
export const FILES_PATH = '/client/:clientId/entity/:entityId/files';
// export const CASH_FLOW_PATH = '/client/:clientId/entity/:entityId/cashFlow/:mode?';
export const LOAN_AMORTIZATION_PATH = '/client/:clientId/entity/:entityId/loanAmortization';
export const CLIENT_TASK_NOTES_PATH = '/client/:clientId/entity/:entityId/task';
export const ADMIN_USER_PATH = '/admin/user/:userId?';
export const ADMIN_USERS_PATH = '/admin/user';
export const ADMIN_COURSES_PATH = '/admin/course';
export const ADMIN_COURSE_PATH = '/admin/course/:courseId?/:moduleId?';

export const FOLDERS_PATH = '/admin/folder';
export const FOLDER_PATH = '/admin/folder/:folderId?';
