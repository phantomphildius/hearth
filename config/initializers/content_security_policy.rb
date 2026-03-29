# Be sure to restart your server when you modify this file.

# Define an application-wide content security policy.
# See the Securing Rails Applications Guide for more information:
# https://guides.rubyonrails.org/security.html#content-security-policy-header

Rails.application.configure do
  config.content_security_policy do |policy|
    policy.default_src :self, :https
    policy.font_src    :self, :https, :data
    policy.img_src     :self, :https, :data
    policy.object_src  :none
    policy.script_src  :self, :https
    policy.style_src   :self, :https

    if Rails.env.development?
      vite_origin = "http://#{ViteRuby.config.host_with_port}"
      # Allow @vite/client to hot reload javascript changes in development
      policy.script_src *policy.script_src, :unsafe_eval, vite_origin
      # Allow @vite/client to hot reload style changes in development
      policy.style_src  *policy.style_src, :unsafe_inline
      # Allow HMR websocket connection
      policy.connect_src :self, vite_origin.sub("http", "ws")
    end
  end

  # Generate session nonces for permitted inline scripts and inline styles.
  config.content_security_policy_nonce_generator = ->(request) { request.session.id.to_s }
  config.content_security_policy_nonce_directives = %w[script-src style-src]
end
