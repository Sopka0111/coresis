import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface Transaction {
  date: string
  type: string
  amount: number
  description?: string
}

interface Student {
  studentId: string
  name: string
  email: string
  program: string
  balance: number
  transactions: Transaction[]
}

export function usePdfExport() {
  // Generate invoice PDF for a student
  const downloadInvoice = (student: Student) => {
    const doc = new jsPDF()
    
    // Header
    doc.setFontSize(20)
    doc.text('Massage School Management System', 20, 20)
    
    doc.setFontSize(16)
    doc.text(`Invoice for ${student.name}`, 20, 35)
    
    // Student details
    doc.setFontSize(12)
    doc.text(`Student ID: ${student.studentId}`, 20, 50)
    doc.text(`Email: ${student.email}`, 20, 60)
    doc.text(`Program: ${student.program}`, 20, 70)
    doc.text(`Current Balance: $${student.balance.toFixed(2)}`, 20, 80)
    
    // Transactions table
    autoTable(doc, {
      startY: 95,
      head: [['Date', 'Type', 'Description', 'Amount']],
      body: student.transactions.map(t => [
        t.date,
        t.type,
        t.description || '',
        `$${t.amount.toFixed(2)}`
      ]),
      styles: {
        fontSize: 10,
        cellPadding: 5
      },
      headStyles: {
        fillColor: [25, 118, 210],
        textColor: 255
      }
    })
    
    // Footer
    const finalY = (doc as any).lastAutoTable.finalY + 10
    doc.setFontSize(10)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, finalY)
    
    doc.save(`invoice-${student.studentId}-${new Date().toISOString().split('T')[0]}.pdf`)
  }

  // Generate financial report PDF
  const downloadFinancialReport = (students: Student[], title: string = 'Financial Report') => {
    const doc = new jsPDF()
    
    // Header
    doc.setFontSize(20)
    doc.text('Massage School Management System', 20, 20)
    
    doc.setFontSize(16)
    doc.text(title, 20, 35)
    
    // Summary
    const totalBalance = students.reduce((sum, student) => sum + student.balance, 0)
    const totalTransactions = students.reduce((sum, student) => sum + student.transactions.length, 0)
    
    doc.setFontSize(12)
    doc.text(`Total Students: ${students.length}`, 20, 50)
    doc.text(`Total Outstanding Balance: $${totalBalance.toFixed(2)}`, 20, 60)
    doc.text(`Total Transactions: ${totalTransactions}`, 20, 70)
    
    // Students table
    autoTable(doc, {
      startY: 85,
      head: [['Student ID', 'Name', 'Program', 'Balance', 'Transactions']],
      body: students.map(s => [
        s.studentId,
        s.name,
        s.program,
        `$${s.balance.toFixed(2)}`,
        s.transactions.length.toString()
      ]),
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [25, 118, 210],
        textColor: 255
      }
    })
    
    // Footer
    const finalY = (doc as any).lastAutoTable.finalY + 10
    doc.setFontSize(10)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, finalY)
    
    doc.save(`financial-report-${new Date().toISOString().split('T')[0]}.pdf`)
  }

  // Generate student list PDF
  const downloadStudentList = (students: Student[], filters: any = {}) => {
    const doc = new jsPDF()
    
    // Header
    doc.setFontSize(20)
    doc.text('Massage School Management System', 20, 20)
    
    doc.setFontSize(16)
    doc.text('Student List Report', 20, 35)
    
    // Filters applied
    if (Object.keys(filters).length > 0) {
      doc.setFontSize(10)
      doc.text('Filters Applied:', 20, 50)
      let yPos = 60
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          doc.text(`${key}: ${value}`, 25, yPos)
          yPos += 5
        }
      })
    }
    
    // Students table
    autoTable(doc, {
      startY: Object.keys(filters).length > 0 ? 80 : 50,
      head: [['Student ID', 'Name', 'Email', 'Program', 'Status', 'Balance']],
      body: students.map(s => [
        s.studentId,
        s.name,
        s.email,
        s.program,
        s.balance > 0 ? 'Outstanding' : 'Paid',
        `$${s.balance.toFixed(2)}`
      ]),
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [25, 118, 210],
        textColor: 255
      }
    })
    
    // Footer
    const finalY = (doc as any).lastAutoTable.finalY + 10
    doc.setFontSize(10)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, finalY)
    
    doc.save(`student-list-${new Date().toISOString().split('T')[0]}.pdf`)
  }

  // Generate placement report PDF
  const downloadPlacementReport = (students: any[], title: string = 'Student Placement Report') => {
    const doc = new jsPDF()
    
    // Header
    doc.setFontSize(20)
    doc.text('Massage School Management System', 20, 20)
    
    doc.setFontSize(16)
    doc.text(title, 20, 35)
    
    // Summary
    const employed = students.filter(s => s.employedStatus === 'Employed').length
    const seeking = students.filter(s => s.employedStatus === 'Seeking').length
    const notSeeking = students.filter(s => s.employedStatus === 'Not Seeking').length
    const placementRate = students.length > 0 ? ((employed / students.length) * 100).toFixed(1) : '0'
    
    doc.setFontSize(12)
    doc.text(`Total Students: ${students.length}`, 20, 50)
    doc.text(`Employed: ${employed}`, 20, 60)
    doc.text(`Seeking Employment: ${seeking}`, 20, 70)
    doc.text(`Not Seeking: ${notSeeking}`, 20, 80)
    doc.text(`Placement Rate: ${placementRate}%`, 20, 90)
    
    // Students table
    autoTable(doc, {
      startY: 105,
      head: [['Student ID', 'Name', 'Program', 'Graduation Date', 'Employment Status', 'Employer']],
      body: students.map(s => [
        s.studentId,
        s.name,
        s.program,
        s.graduationDate || 'N/A',
        s.employedStatus || 'Unknown',
        s.employer?.name || 'N/A'
      ]),
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [25, 118, 210],
        textColor: 255
      }
    })
    
    // Footer
    const finalY = (doc as any).lastAutoTable.finalY + 10
    doc.setFontSize(10)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, finalY)
    
    doc.save(`placement-report-${new Date().toISOString().split('T')[0]}.pdf`)
  }

  return {
    downloadInvoice,
    downloadFinancialReport,
    downloadStudentList,
    downloadPlacementReport
  }
} 