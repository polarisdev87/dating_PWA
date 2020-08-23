import { environment } from '@environments/environment';
import { LoginOpt, AuthServiceConfig, GoogleLoginProvider } from 'angularx-social-login';

export function getAuthServiceConfigs() {
    const fbLoginOptions: LoginOpt = {
        scope: 'public_profile,email,user_gender,user_age_range,user_photos',
        return_scopes: true,
        enable_profile_selector: true,
        redirect_uri: environment.originURL
      };

    const googleLoginOptions: LoginOpt = {
        scope: 'profile email'
      };  
    let config = new AuthServiceConfig(
        [
            {
                id: GoogleLoginProvider.PROVIDER_ID,
                provider: new GoogleLoginProvider(environment.googleAppID, googleLoginOptions)
            }
        ]
    );
    return config;
}