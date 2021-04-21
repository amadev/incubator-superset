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
import { InfoTooltipWithTrigger } from '@superset-ui/chart-controls';

import Popover from 'src/common/components/Popover';
import Label from 'src/components/Label';
import AdhocFilterOption from './AdhocFilterOption';
import CustomFilterEditPopover from './CustomFilterEditPopover';
import CustomFilter from '../CustomFilter';

const propTypes = {
  customFilter: PropTypes.instanceOf(CustomFilter).isRequired,
  onFilterEdit: PropTypes.func.isRequired,
  datasource: PropTypes.object,
};

class CustomFilterOption extends AdhocFilterOption {
  constructor(props) {
    super(props);
    this.state = {
      popoverVisible: !!props.customFilter.isNew,
    };
    console.log("CustomFilterOption INITED!!!");
    console.log(this);
  }

  componentWillUnmount() {
    // isNew is used to auto-open the popup. Once popup is viewed, it's not
    // considered new anymore. We mutate the prop directly because we don't
    // want excessive rerenderings.
    this.props.customFilter.isNew = false;
  }

  togglePopover(visible) {
    this.setState(({ popoverVisible }) => {
      this.props.customFilter.isNew = false;
      return {
        popoverVisible: visible === undefined ? !popoverVisible : visible,
      };
    });
  }

  render() {
    const { customFilter } = this.props;
    const overlayContent = (
      <CustomFilterEditPopover
        customFilter={customFilter}
        datasource={this.props.datasource}
        onResize={this.onPopoverResize}
        onClose={this.closePopover}
        onChange={this.props.onFilterEdit}
      />
    );

    return (
      <div
        role="button"
        tabIndex={0}
        onMouseDown={e => e.stopPropagation()}
        onKeyDown={e => e.stopPropagation()}
      >
        {customFilter.isExtra && (
          <InfoTooltipWithTrigger
            icon="exclamation-triangle"
            placement="top"
            className="m-r-5 text-muted"
            tooltip={t(`
                This filter was inherited from the dashboard's context.
                It won't be saved when saving the chart.
              `)}
          />
        )}
        <Popover
          placement="right"
          trigger="click"
          content={overlayContent}
          defaultVisible={this.state.popoverVisible || customFilter.isNew}
          visible={this.state.popoverVisible}
          onVisibleChange={() => this.togglePopover(true)}
          overlayStyle={{ zIndex: 1 }}
        >
          <Label className="option-label adhoc-option adhoc-filter-option">
            {customFilter.getDefaultLabel()}
            <i className="fa fa-caret-right adhoc-label-arrow" />
          </Label>
        </Popover>
      </div>
    );
  }
}

export default CustomFilterOption;

CustomFilterOption.propTypes = propTypes;
