declare namespace API_PostSystemConfig {
  export interface Res {
    err: number
    msg: string
    res: Config
  }

  export interface Config {
    system_name: string
    system_logo: string
    dots_per_second: number
    refresh_interval: number
    email_config: EmailConfig
  }

  export interface EmailConfig {
    host: string
    port: number
    username: string
    authorization_code: string
    is_send: boolean
  }
}
