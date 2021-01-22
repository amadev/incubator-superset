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
from flask import g, redirect, send_from_directory
from flask_appbuilder import expose

from superset import appbuilder, conf
from superset.typing import FlaskResponse
from superset.utils import core as utils
from superset.views.base import BaseSupersetView, common_bootstrap_payload
from superset.views.utils import bootstrap_user_data


class Cubes(BaseSupersetView):
    """The base views for Superset!"""

    @expose("/")
    def index(self) -> FlaskResponse:  # pylint: disable=no-self-use
        if not g.user or not g.user.get_id():
            if conf.get("PUBLIC_ROLE_LIKE_GAMMA", False) or conf["PUBLIC_ROLE_LIKE"]:
                return self.render_template("superset/public_welcome.html")
            return redirect(appbuilder.get_url_for_login)

        payload = {
            "user": bootstrap_user_data(g.user),
            "common": common_bootstrap_payload(),
        }

        cubes_url = conf.get("CUBES_BACKEND", "")
        return self.render_template(
            "superset/crud_views.html",
            entry="crudViews",
            embed_html=f'<iframe src="/cubes/viewer?cubesUrl={cubes_url}" '
            'style="height: 100%"></iframe>',
            bootstrap_data=json.dumps(
                payload, default=utils.pessimistic_json_iso_dttm_ser
            ),
        )

    @expose("/viewer")
    def viewer(self) -> FlaskResponse:  # pylint: disable=no-self-use
        return self.render_template("cubes/studio.html")

    @expose("/<path:path>")
    def send_static(self, path: str) -> FlaskResponse:  # pylint: disable=no-self-use
        return send_from_directory("templates/cubes", path)
