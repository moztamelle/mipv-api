import yup, { mixed, number, object, string } from 'yup'
export enum OrderPayMethod {
  MPESA = 'M-PESA',
  EMOLA = 'E-MOLA',
  MKESH = 'M-KESH',
}

export const createEvent: yup.Schema = object({
  pay_value: number()
    .required('É obrigatório definir o preço.')
    .positive('O preço deve ser positivo.'),
  pay_method: mixed<OrderPayMethod>()
    .oneOf(Object.values(OrderPayMethod))
    .required('Defina o método de pagamento que pode ser M-PESA'),
  pay_source: string().matches(
    /^8[2-7]\d{7}$/,
    'O número de telefone fornecido não é válido.'
  ),
  information: string().required(
    'Defina o campo information, pode ter uma string vazia.'
  ),
  // Campos da interface Event
  name: string().required('O nome do evento é obrigatório.'),
  type: string().required('O tipo do evento é obrigatório.'),
  location: string().optional(),
  coords: string().optional(),
})

export const updateEvent: yup.Schema = object({
  id: number().required('Insira o id do evento'),
  information: string().required(
    'Defina o campo information, pode ter uma string vazia.'
  ),
  // Campos da interface Event
  name: string().required('O nome do evento é obrigatório.'),
  date: string().required('A data do evento é obrigatório.'),
  type: string().required('O tipo do evento é obrigatório.'),
  location: string().optional(),
  coords: string().optional(),
})
