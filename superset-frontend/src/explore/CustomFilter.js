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

const KEY_INVALID_SYMBOLS = [',', '.', '/', '\\', '\'', '"', '|'];
const VALUE_INVALID_SYMBOLS = ["'", '"', '|'];

export default class CustomFilter {
  constructor(customFilter) {
    this.slice_id = customFilter.slice_id;
    this.key = customFilter.key || `key_${Math.random().toString(36).substring(2, 15)}`;
    this.value = customFilter.value;
    this.isExtra = !!customFilter.isExtra;
    this.isNew = !!customFilter.isNew;
    this.filterOptionName =
      customFilter.filterOptionName ||
      `filter_${Math.random()
        .toString(36)
        .substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`;
  }

  duplicateWith(nextFields) {
    return new CustomFilter({
      ...this,
      // all duplicated fields are not new (i.e. will not open popup automatically)
      isNew: false,
      ...nextFields,
    })
  }

  equals(customFilter) {
    return (
      customFilter.key === this.key &&
      customFilter.value === this.value
    );
  }

  isValid() {
    if (this.key && (KEY_INVALID_SYMBOLS.some(s => this.key.includes(s)) || this.key.length >= 50)) {
      return false;
    }
    if (this.value && VALUE_INVALID_SYMBOLS.some(s => this.value.includes(s))) {
      return false;
    }
    return true;
  }

  getDefaultLabel() {
    let label = this.key + ':= ';
    let value = this.value;
    if (value) {
      value = value.length >= 50 ? value : value.slice(0, 50);
      label += value;
    }
    label = label.length <= 65 ? label : label.slice(0, 62) + '...';
    return label;
  }
}
