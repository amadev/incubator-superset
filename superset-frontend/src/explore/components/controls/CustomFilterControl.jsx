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
import PropTypes from 'prop-types';

import { t } from '@superset-ui/core';

import Select from 'src/components/Select';
import Button from 'src/components/Button';
import AdhocFilterControl from './AdhocFilterControl';
import ControlHeader from '../ControlHeader';
import customFilterType from '../../propTypes/customFilterType';
import CustomFilter from '../../CustomFilter';
import CustomFilterOption from '../CustomFilterOption';

const propTypes = {
  name: PropTypes.string,
  onChange: PropTypes.func,
  value: PropTypes.arrayOf(customFilterType),
  datasource: PropTypes.object,
  formData: PropTypes.shape({
    slice_id: PropTypes.number,
    // custom_filters_processed: PropTypes.bool,
  }),
  isLoading: PropTypes.bool,
};

const defaultProps = {
  name: '',
  onChange: () => {},
  formData: {},
};

function isDictionaryForCustomFilter(value) {
  return value && !(value instanceof CustomFilter);
}

export default class CustomFilterControl extends AdhocFilterControl {
  constructor(props) {
    super(props);

    const filters = (this.props.value || []).map(filter =>
      isDictionaryForCustomFilter(filter) ? new CustomFilter(filter) : filter,
    );

    this.valueRenderer = customFilter => (
      <CustomFilterOption
        customFilter={customFilter}
        onFilterEdit={this.onFilterEdit}
        datasource={this.props.datasource}
      />
    );
    this.state = {
      values: filters,
    };
  }

  componentDidMount() {
    //pass
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.value !== nextProps.value) {
      this.setState({
        values: (nextProps.value || []).map(filter =>
          isDictionaryForCustomFilter(filter) ? new CustomFilter(filter) : filter,
        ),
      });
    }
  }

  onChange(opts) {
    const options = (opts || [])
      .map(option => {
        // already a CustomFilter, skip
        if (option instanceof CustomFilter) {
          return option;
        }
        // add a new filter item
        if (option.key && option.value) {
          return new CustomFilter({
            slice_id: option.slice_id,
            key: option.key,
            value: option.value,
            isNew: true,
          });
        }
        return null;
      })
      .filter(option => option);
    this.props.onChange(options);
  }

  getMetricExpression(metrics) {
    //pass
  }

  optionsForSelect(props) {
    //pass
  }

  onAddClick() {
    let newValues = this.state.values || [];
    const newCustomFilter = new CustomFilter({
      slice_id: this.props.formData.slice_id,
      isNew: true,
    });
    newValues.push(newCustomFilter);
    this.setState({values: newValues});
    this.props.onChange(newValues);
  }

  render() {
    return (
      <div className="metrics-select" data-test="custom-filter-control">
        <ControlHeader {...this.props} />
        <Select
          isMulti
          isLoading={this.props.isLoading}
          name={`select-${this.props.name}`}
          placeholder={t('Add one or more key:value pairs')}
          options={this.state.options}
          value={this.state.values}
          labelKey="label"
          valueKey="filterOptionName"
          clearable
          closeOnSelect
          onChange={this.onChange}
          valueRenderer={this.valueRenderer}
        />
        <Button
          buttonSize="small"
          buttonStyle="primary"
          onClick={this.onAddClick.bind(this)}
          style={{marginTop: "5px"}}
        >
          {t('Add Filter')}
        </Button>
      </div>
    );
  }
}

CustomFilterControl.propTypes = propTypes;
CustomFilterControl.defaultProps = defaultProps;
