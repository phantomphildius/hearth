# Be sure to restart your server when you modify this file.

# Define an application-wide content security policy.
# See the Securing Rails Applications Guide for more information:
# https://guides.rubyonrails.org/security.html#content-security-policy-header

Rails.application.configure do
  config.content_security_policy do |policy|
    policy.default_src(:self, :https)
    policy.font_src(:self, :https, :data)
    policy.img_src(:self, :https, :data)
    policy.object_src(:none)
    policy.script_src(:self, :https)
    policy.style_src(:self, :https)

    if Rails.env.development?
      vite_origin = "http://#{ViteRuby.config.host_with_port}"
      # Allow @vite/client to hot reload javascript changes in development
      policy.script_src(*policy.script_src, :unsafe_eval, vite_origin)
      # Allow @vite/client to hot reload style changes in development
      policy.style_src(*policy.style_src, :unsafe_inline)
      # Allow HMR websocket connection
      policy.connect_src(:self, vite_origin.sub("http", "ws"))
    end
  end

  # Nonces for inline scripts only — style-src is excluded because Vite injects
  # styles dynamically and a nonce on style-src overrides unsafe-inline in CSP level 2+.
  config.content_security_policy_nonce_generator = ->(_request) { SecureRandom.random_bytes(16).hex }
  config.content_security_policy_nonce_directives = ["script-src"]
end
