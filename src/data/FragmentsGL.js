import gql from 'graphql-tag';

export const CLIENT_FRAGMENT = gql`
   fragment clientInfo on Client {
      id
      addressLineOne
      addressLineTwo
      cityId
      contactName
      email
      name
      phone
      stateId
      zipCode
      note
      startMonth
      isDeleted
   }
`;

export const CLIENT_REPORT_FRAGMENT = gql`
   fragment clientReportInfo on Client {
      id
      addressLineOne
      addressLineTwo
      city {
         id
         name
      }
      contactName
      email
      name
      phone
      state {
         id
         name
      }
      zipCode
      note
      startMonth
      isDeleted
   }
`;

export const USER_FRAGMENT = gql`
   fragment userInfo on User {
      id
      contactName
      username
      email
      clientId
      entityIdList
      isDeleted
   }
`;

// lms
export const COURSE_FRAGMENT = gql`
   fragment courseInfo on Course {
      id
      name
      description
      keywords
      active
   }
`;

export const MODULES_FRAGMENT = gql`
   fragment moduleInfo on Modules {
      id
      course_id
      name
      order_no
      isDeleted
   }
`;

export const UNITS_FRAGMENT = gql`
   fragment unitInfo on Units {
      id
      module_id
      name
      description
      introVideo
      transcript
      isDeleted
   }
`;
export const RESOURCES_FRAGMENT = gql`
   fragment resourcesInfo on Resources {
      id
      unit_id
      label
      type
      path_url
      isDeleted
      original_filename
   }
`;
// lms end
export const TASK_FRAGMENT = gql`
   fragment taskInfo on Task {
      id
      dueDate
      isCompleted
      subject
      isDeleted
      clientId
      userId
      entityId
      repeatAmount
      repeatTask
      repeatInterval
      lastCompletionDateTime
   }
`;

export const TASK_HISTORY_FRAGMENT = gql`
   fragment taskHistoryInfo on TaskHistory {
      id
      dueDate
      completionDateTime
      taskId
      isDeleted
   }
`;

export const ENTITY_FRAGMENT = gql`
   fragment entityInfo on Entity {
      id
      name
      ein
      entityId
      description
      clientId
      isActive
      isDeleted
   }
`;
// The properties of Client needed for the client queries. Always use the same properties to aid caching.
export const FILE_FRAGMENT = gql`
   fragment fileInfo on FileUpload {
      id
      clientId
      entityId
      tag
      fileData {
         id: fileHash
         fileFilename
         fileS3
      }
   }
`;

export const ASSET_FRAGMENT = gql`
   fragment assetInfo on Asset {
      id
      assetId
      assetCategoryId
      snapshotDate
      assetCategory {
         id
         name
         term
      }
      entityId
      entity {
         id
         name
      }
      amount
      description
      isCollateral
      quantity
      head
      weight
      price
      year
      unitTypeId
      acres
      isRemoved
      startDate
      removedDate
   }
`;

export const UNIT_TYPE_FRAGMENT = gql`
   fragment unitTypeInfo on UnitType {
      id
      name
   }
`;

export const LIABILITY_FRAGMENT = gql`
   fragment liabilityInfo on Liability {
      id
      liabilityId
      interestRate
      note
      bankId
      bank {
         id
         name
      }
      liabilityCategoryId
      liabilityCategory {
         id
         name
      }
      entityId
      entity {
         id
         name
      }
      amount
      description
      isCollateral
      isRemoved
      payment
      paymentDueDate
      paymentMaturityDate
      startDate
      removedDate
      createdDateTime
   }
`;

export const INCOME_FRAGMENT = gql`
   fragment incomeInfo on Income {
      id
      actual
      date
      #      description
      entityId
      expected
      incomeTypeId
      #      incomeType {
      #         id
      #         name
      #      }
      isDeleted
      noteActual
      noteExpected
   }
`;

export const INCOME_TYPE_FRAGMENT = gql`
   fragment incomeTypeInfo on IncomeType {
      id
      name
      entityId
      isTaxable
      isDeleted
   }
`;

export const EXPENSE_FRAGMENT = gql`
   fragment expenseInfo on Expense {
      id
      actual
      date
      entityId
      expected
      expenseTypeId
      isDeleted
      noteActual
      noteExpected
   }
`;

export const EXPENSE_TYPE_FRAGMENT = gql`
   fragment expenseTypeInfo on ExpenseType {
      id
      name
      entityId
      isDeleted
      isTaxable
   }
`;

export const BALANCE_REPORT_FRAGMENT = gql`
   fragment balanceReportInfo on BalanceReport {
      assets {
         current {
            categories {
               categoryName
               total
            }
            total
         }
         intermediate {
            categories {
               categoryName
               total
            }
            total
         }
         longTerm {
            categories {
               categoryName
               total
            }
            total
         }
      }
      liabilities {
         current {
            categories {
               categoryName
               total
            }
            total
         }
         intermediate {
            categories {
               categoryName
               total
            }
            total
         }
         longTerm {
            categories {
               categoryName
               total
            }
         }
      }
      currentRatio
      equityAssetPercentage
      totalAssetCount
      totalAssets
      totalEquity
      totalEquityCount
      totalLiabilities
      totalLiabilityCount
      workingCapital
   }
`;

export const LOAN_ANALYSIS_FRAGMENT = gql`
   fragment loanAnalysisInfo on LoanAnalysis {
      assets {
         bankLoanValue
         current {
            bankLoanValue
            marketValue
            loanToValue
            bankLoanValue
            categories {
               categoryName
               bankLoanValue
               marketValue
               loanToValue
            }
         }
         intermediate {
            bankLoanValue
            loanToValue
            marketValue
            categories {
               categoryName
               bankLoanValue
               marketValue
               loanToValue
            }
         }
         loanToValue
         longTerm {
            bankLoanValue
            loanToValue
            marketValue
            categories {
               categoryName
               bankLoanValue
               marketValue
               loanToValue
            }
         }
         marketValue
         totalAssets: marketValue
      }
      liabilities {
         totalLiabilities: marketValue
         current {
            subtotalLiabilities: marketValue
            categories {
               categoryName
               currentBalance: marketValue
            }
         }
         intermediate {
            subtotalLiabilities: marketValue
            categories {
               categoryName
               currentBalance: marketValue
            }
         }
         loanToValue
         longTerm {
            subtotalLiabilities: marketValue
            categories {
               categoryName
               currentBalance: marketValue
            }
         }
      }
      clientLeverage
      lessTotalLiabilities
      totalBankSafetyNet
   }
`;

const CASH_FLOW_SEGMENT_FRAGMENT = gql`
   fragment cashFlowSegmentInfo on CashFlowInfo {
      id
      actual
      expected
      noteActual
      noteExpected
   }
`;

const CASH_FLOW_INCOME_EXPENSE_INFO = gql`
   fragment cashFlowIncomeExpenseInfo on CashFlowIncomeExpenseInfo {
      id
      jan {
         ...cashFlowSegmentInfo
      }
      feb {
         ...cashFlowSegmentInfo
      }
      mar {
         ...cashFlowSegmentInfo
      }
      apr {
         ...cashFlowSegmentInfo
      }
      may {
         ...cashFlowSegmentInfo
      }
      jun {
         ...cashFlowSegmentInfo
      }
      jul {
         ...cashFlowSegmentInfo
      }
      aug {
         ...cashFlowSegmentInfo
      }
      sep {
         ...cashFlowSegmentInfo
      }
      oct {
         ...cashFlowSegmentInfo
      }
      nov {
         ...cashFlowSegmentInfo
      }
      dec {
         ...cashFlowSegmentInfo
      }
      annual {
         ...cashFlowSegmentInfo
      }
      typeName
      typeId
      entityId
   }
`;

export const CASH_FLOW_FRAGMENT = gql`
   fragment cashFlowInfo on CashFlowReport {
      id
      actualOperatingLoanBalanceEnd
      actualYTDCashFlow
      expectedOperatingLoanBalanceEnd
      expectedYTDCashFlow
      monthOrder
      startMonth
      income {
         ...cashFlowIncomeExpenseInfo
      }
      incomeGlobal {
         ...cashFlowIncomeExpenseInfo
      }
      expenses {
         ...cashFlowIncomeExpenseInfo
      }
      expenseGlobal {
         ...cashFlowIncomeExpenseInfo
      }
      netCashFlow {
         ...cashFlowIncomeExpenseInfo
      }
      operatingLoanBalance {
         ...cashFlowIncomeExpenseInfo
      }
   }
   ${CASH_FLOW_INCOME_EXPENSE_INFO}
   ${CASH_FLOW_SEGMENT_FRAGMENT}
`;

export const ENTITY_CASH_FLOW_FRAGMENT = gql`
   fragment entityCashFlowInfo on EntityCashFlow {
      id
      actualOperatingLoanBalance
      date
      entityId
      expectedOperatingLoanBalance
      targetIncome
      operatingLoanLimit
      carryoverIncome
      year
   }
`;

export const SEAT_FRAGMENT = gql`
   fragment seatInfo on Seat {
      id
      name
      responsibilities
      order
      seatId
      userIdList
      entityId
      isDeleted
      createdDateTime
   }
`;

export const FOLDER_FRAGMENT = gql`
   fragment folderInfo on FolderTemplate {
      id
      name
      description
      isDeleted
   }
`;

export const CASH_CONTRACT_FRAGMENT = gql`
   fragment cashContractInfo on CashContract {
      id
      bushelsSold
      contractId: cashContractId
      contractNumber
      crop
      date
      deliveryLocation
      deliveryMonth
      description
      entityId
      entity {
         id
         name
      }
      isDeleted
      isDelivered
      isHistorical
      isNew
      isRemoved
      price
      removedDate
      snapshotDate
      startDate
   }
`;

export const FUTURE_CONTRACT_FRAGMENT = gql`
   fragment futureContractInfo on FuturesContract {
      id
      bushels
      cashPrice
      contractNumber
      crop
      date
      deliveryLocation
      description
      entityId
      entity {
         id
         name
      }
      estimatedBasis
      contractId: futuresContractId
      futuresPrice
      isDeleted
      isHistorical
      isRemoved
      month
      removedDate
      snapshotDate
      startDate
      year
   }
`;

export const HEDGE_CONTRACT_FRAGMENT = gql`
   fragment hedgeContractInfo on HedgesContract {
      id
      bushels
      contractNumber
      crop
      currentMarketValue
      date
      description
      entityId
      entity {
         id
         name
      }
      contractId: hedgesContractId
      isDeleted
      isHistorical
      isRemoved
      month
      removedDate
      snapshotDate
      startDate
      strikeCost
      strikePrice
      year
   }
`;
