# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.
import simplejson as json
from flask import g, redirect, request, Response, send_from_directory
from flask_appbuilder import expose
from flask_appbuilder.models.sqla.interface import SQLAInterface
from flask_appbuilder.security.decorators import has_access, has_access_api
from flask_babel import lazy_gettext as _

from superset import db, is_feature_enabled
from superset.constants import MODEL_VIEW_RW_METHOD_PERMISSION_MAP, RouteMethod
from superset.models.sql_lab import Query, SavedQuery, TableSchema, TabState
from superset.typing import FlaskResponse
from superset.utils import core as utils

from .base import BaseSupersetView, DeleteMixin, json_success, SupersetModelView

from superset import (
    app,
    appbuilder,
    conf,
    db,
    event_logger,
    get_feature_flags,
    is_feature_enabled,
    results_backend,
    results_backend_use_msgpack,
    security_manager,
    sql_lab,
    viz,
)
from superset.views.utils import (
    _deserialize_results_payload,
    apply_display_max_row_limit,
    bootstrap_user_data,
    check_datasource_perms,
    check_explore_cache_perms,
    check_slice_perms,
    get_cta_schema_name,
    get_dashboard_extra_filters,
    get_datasource_info,
    get_form_data,
    get_viz,
    is_owner,
)
from superset.models.user_attributes import UserAttribute
from superset.views.base import (
    api,
    BaseSupersetView,
    check_ownership,
    common_bootstrap_payload,
    create_table_permissions,
    CsvResponse,
    data_payload_response,
    generate_download_headers,
    get_error_msg,
    get_user_roles,
    handle_api_exception,
    json_error_response,
    json_errors_response,
    json_success,
    validate_sqlatable,
)


class Cubes(BaseSupersetView):
    """The base views for Superset!"""

    @expose("/")
    def index(self) -> FlaskResponse:  # pylint: disable=no-self-use
        if not g.user or not g.user.get_id():
            if conf.get("PUBLIC_ROLE_LIKE_GAMMA", False) or conf["PUBLIC_ROLE_LIKE"]:
                return self.render_template("superset/public_welcome.html")
            return redirect(appbuilder.get_url_for_login)

        welcome_dashboard_id = (
            db.session.query(UserAttribute.welcome_dashboard_id)
            .filter_by(user_id=g.user.get_id())
            .scalar()
        )
        if welcome_dashboard_id:
            return self.dashboard(str(welcome_dashboard_id))

        payload = {
            "user": bootstrap_user_data(g.user),
            "common": common_bootstrap_payload(),
        }

        cubes_url = conf.get("CUBES_BACKEND", "")
        return self.render_template(
            "superset/crud_views.html",
            entry="crudViews",
            embed_html=f'<iframe src="/cubes/viewer?cubesUrl={cubes_url}" style="height: 100%"></iframe>',
            bootstrap_data=json.dumps(
                payload, default=utils.pessimistic_json_iso_dttm_ser
            ),
        )

    @expose("/viewer")
    def viewer(self) -> FlaskResponse:  # pylint: disable=no-self-use
        return self.render_template("cubes/studio.html")

    @expose('/<path:path>')
    def send_static(self, path):
        return send_from_directory('templates/cubes', path)
