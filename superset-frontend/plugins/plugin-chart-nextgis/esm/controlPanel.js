/* eslint-disable camelcase */

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import React from 'react';
import { t, validateNonEmpty, addLocaleData, smartDateFormatter } from '@superset-ui/core';
import { formatSelectOptions, D3_TIME_FORMAT_OPTIONS, ColumnOption } from '@superset-ui/chart-controls';
import i18n from './i18n';
addLocaleData(i18n);
export const PAGE_SIZE_OPTIONS = formatSelectOptions([[0, t('page_size.all')], 10, 20, 50, 100, 200]);
export let QueryMode;

(function (QueryMode) {
  QueryMode["aggregate"] = "aggregate";
  QueryMode["raw"] = "raw";
})(QueryMode || (QueryMode = {}));

const QueryModeLabel = {
  [QueryMode.aggregate]: t('Aggregate'),
  [QueryMode.raw]: t('Raw Records')
};

function getQueryMode(controls) {
  var _controls$query_mode, _controls$all_columns;

  const mode = controls == null ? void 0 : (_controls$query_mode = controls.query_mode) == null ? void 0 : _controls$query_mode.value;

  if (mode === QueryMode.aggregate || mode === QueryMode.raw) {
    return mode;
  }

  const rawColumns = controls == null ? void 0 : (_controls$all_columns = controls.all_columns) == null ? void 0 : _controls$all_columns.value;
  const hasRawColumns = rawColumns && (rawColumns == null ? void 0 : rawColumns.length) > 0;
  return hasRawColumns ? QueryMode.raw : QueryMode.aggregate;
}
/**
 * Visibility check
 */


function isQueryMode(mode) {
  return ({
    controls
  }) => {
    return getQueryMode(controls) === mode;
  };
}

const isAggMode = isQueryMode(QueryMode.aggregate);
const isRawMode = isQueryMode(QueryMode.raw);
const queryMode = {
  type: 'RadioButtonControl',
  label: t('Query Mode'),
  default: null,
  options: [{
    label: QueryModeLabel[QueryMode.aggregate],
    value: QueryMode.aggregate
  }, {
    label: QueryModeLabel[QueryMode.raw],
    value: QueryMode.raw
  }],
  mapStateToProps: ({
    controls
  }) => {
    return {
      value: getQueryMode(controls)
    };
  }
};
const all_columns = {
  type: 'SelectControl',
  label: t('Columns'),
  description: t('Columns to display'),
  multi: true,
  freeForm: true,
  allowAll: true,
  commaChoosesOption: false,
  default: [],
  optionRenderer: c => /*#__PURE__*/React.createElement(ColumnOption, {
    showType: true,
    column: c
  }),
  valueRenderer: c => /*#__PURE__*/React.createElement(ColumnOption, {
    column: c
  }),
  valueKey: 'column_name',
  mapStateToProps: ({
    datasource,
    controls
  }) => ({
    options: (datasource == null ? void 0 : datasource.columns) || [],
    queryMode: getQueryMode(controls)
  }),
  visibility: isRawMode
};
const percent_metrics = {
  type: 'MetricsControl',
  label: t('Percentage Metrics'),
  description: t('Metrics for which percentage of total are to be displayed'),
  multi: true,
  visibility: isAggMode,
  mapStateToProps: ({
    datasource,
    controls
  }) => {
    return {
      columns: (datasource == null ? void 0 : datasource.columns) || [],
      savedMetrics: (datasource == null ? void 0 : datasource.metrics) || [],
      datasourceType: datasource == null ? void 0 : datasource.type,
      queryMode: getQueryMode(controls)
    };
  },
  default: [],
  validators: []
};
const config = {
  controlPanelSections: [{
    label: t('Query'),
    expanded: true,
    controlSetRows: [
      ['adhoc_filters'],
    ]
  }],
  sectionOverrides: {
    druidTimeSeries: {
      controlSetRows: [['granularity', 'druid_time_origin'], ['time_range']]
    },
    sqlaTimeSeries: {
      controlSetRows: [['granularity_sqla', 'time_grain_sqla'], ['time_range']]
    }
  }
};
export default config;
