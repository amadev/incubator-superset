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
import { FormGroup } from 'react-bootstrap';
import { Select } from 'src/common/components/Select';
import { t } from '@superset-ui/core';

import CustomFilter from '../CustomFilter';

const propTypes = {
  customFilter: PropTypes.instanceOf(CustomFilter).isRequired,
  onChange: PropTypes.func.isRequired,
  onHeightChange: PropTypes.func.isRequired,
  datasource: PropTypes.object,
  popoverRef: PropTypes.object,
};

const defaultProps = {
  datasource: {},
};

export default class CustomFilterEditPopoverTabContent extends React.Component {
  constructor(props) {
    super(props);
    this.onKeyChange = this.onKeyChange.bind(this);
    this.onValueChange = this.onValueChange.bind(this);

    this.menuPortalProps = {
      menuPortalTarget: props.popoverRef,
      menuPosition: 'fixed',
      menuPlacement: 'bottom',
    };
  }

  UNSAFE_componentWillMount(prevProps) {
    // pass
  }

  onKeyChange(event) {
    this.props.onChange(
      this.props.customFilter.duplicateWith({
        key: event.target.value,
      }),
    );
  }

  onValueChange(event) {
    this.props.onChange(
      this.props.customFilter.duplicateWith({
        value: event.target.value,
      }),
    );
  }

  focusKeyValue(ref) {
    if (ref) {
      ref.focus();
    }
  }

  render() {
    const { customFilter } = this.props;
    const { key, value } = customFilter;

    return (
      <>
        <FormGroup className="adhoc-filter-simple-column-dropdown">
          <input
              name="filter-column"
              ref={this.focusKeyValue}
              type="text"
              maxLength="50"
              onChange={this.onKeyChange}
              value={key}
              className="form-control input-sm"
              placeholder={t('Input filter key name')}
              disabled={ false }
            />
        </FormGroup>
        <FormGroup data-test="adhoc-filter-simple-value">
            <input
              name="filter-value"
              ref={this.focusKeyValue}
              type="text"
              maxLength="2048"
              onChange={this.onValueChange}
              value={value || ''}
              className="form-control input-sm"
              placeholder={t('Input filter value')}
              disabled={ false }
            />
        </FormGroup>
      </>
    );
  }
}
CustomFilterEditPopoverTabContent.propTypes = propTypes;
CustomFilterEditPopoverTabContent.defaultProps = defaultProps;
