import { useAuth } from '../context/AuthContext'
import * as accountService from '../service/account'
import * as categoriesService from '../service/categories'
import * as transactionsService from '../service/transactions'

export const useUserServices = () => {
  const { user } = useAuth()

  return {
    // Accounts
    getAccounts: () => accountService.getAccounts(user.uid),
    createAccount: (data) => accountService.createAccount({ ...data, userId: user.uid }),
    updateAccount: accountService.updateAccount,
    deleteAccount: accountService.deleteAccount,

    // Categories
    getCategories: () => categoriesService.getCategories(user.uid),
    createCategory: (data) => categoriesService.createCategory({ ...data, userId: user.uid }),
    updateCategory: categoriesService.updateCategory,
    deleteCategory: categoriesService.deleteCategory,

    // Transactions
    getIngresos: () => transactionsService.getIngresos(user.uid),
    createIngreso: (data) => transactionsService.createIngreso({ ...data, userId: user.uid }),
    updateIngreso: transactionsService.updateIngreso,
    deleteIngreso: transactionsService.deleteIngreso,

    getGastos: () => transactionsService.getGastos(user.uid),
    createGasto: (data) => transactionsService.createGasto({ ...data, userId: user.uid }),
    updateGasto: transactionsService.updateGasto,
    deleteGasto: transactionsService.deleteGasto,
  }
}
