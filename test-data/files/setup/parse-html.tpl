{%- extends 'basic.tpl' -%}

{% block input %}
<pre {% if nb.metadata.language_info %}data-code-language="{{ nb.metadata.language_info.name }}" data-executable="true"{% endif %} data-type="programlisting">
{{ cell.source|e}}
</pre>
{% endblock input %}

{% block stream_stdout -%}
<pre class="output_subarea output_stream output_stdout output_text" data-output="true">
{{- output.text | ansi2html -}}
</pre>
{%- endblock stream_stdout %}

{% block stream_stderr -%}
<pre class="output_subarea output_stream output_stderr output_text" data-output="true">
{{- output.text | ansi2html -}}
</pre>
{%- endblock stream_stderr %}

{% block error -%}
<pre class="output_subarea output_text output_error" data-output="true">
{{- super() -}}
</pre>
{%- endblock error %}

{%- block data_text scoped %}
<pre class="output_text output_subarea {{extra_class}}" data-output="true">
{{- output.data['text/plain'] | ansi2html -}}
</pre>
{%- endblock -%}

{% block markdowncell scoped %}
{{ self.empty_in_prompt() }}
{{ cell.source  | markdown2html | strip_files_prefix }}
{%- endblock markdowncell %}