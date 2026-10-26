import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-start gap-3">
      <h1 className="m-0 text-[30px] font-bold">Página não encontrada</h1>
      <Link to="/">Voltar para a biblioteca</Link>
    </div>
  )
}
