export interface static_output_types<dataschema = {}> {
  message: string;
  data?: dataschema | any;
  statusCode?: number;
  errorCode?: string;
  success?: boolean;
}
