import React, { useState } from 'react';
import { CreditCard, Wallet, Clock, Check, ChevronRight, Shield, AlertCircle } from 'lucide-react';
import Card from '../components/Card';
import useTelegram from '../hooks/useTelegram';

const PaymentPage = () => {
  const { showConfirm, showAlert } = useTelegram();
  const [selectedPlan, setSelectedPlan] = useState(null);

  const subscriptionPlans = [
    {
      id: 'basic',
      name: 'Basic',
      price: 49,
      duration: '1 місяць',
      features: [
        'Спотові сигнали',
        'Базові навчальні матеріали',
        'Доступ до загального чату'
      ],
      color: 'from-blue-600 to-blue-400'
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 99,
      duration: '1 місяць',
      features: [
        'Все з Basic плану',
        "Ф'ючерсні сигнали",
        'Розширені навчальні матеріали',
        'VIP чат з аналітиками'
      ],
      recommended: true,
      color: 'from-purple-600 to-blue-600'
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 199,
      duration: '3 місяці',
      features: [
        'Все з Pro плану',
        'Персональні консультації',
        'Пріоритетна підтримка',
        "Доступ до закритого ком'юніті"
      ],
      color: 'from-yellow-500 to-orange-500'
    }
  ];

  const paymentMethods = [
    {
      id: 'card',
      name: 'Банківська карта',
      icon: <CreditCard className="w-6 h-6" />,
      description: 'Visa/Mastercard',
    },
    {
      id: 'crypto',
      name: 'Криптовалюта',
      icon: <Wallet className="w-6 h-6" />,
      description: 'USDT, BTC, ETH',
    }
  ];

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
  };

  const handlePayment = async (method) => {
    if (!selectedPlan) {
      showAlert('Будь ласка, виберіть план підписки');
      return;
    }

    const confirmed = await showConfirm(
      `Підтвердіть оплату ${selectedPlan.price}$ за план ${selectedPlan.name}`
    );

    if (confirmed) {
      // TODO: Implement payment processing
      showAlert('Переадресація на сторінку оплати...');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Тарифні плани</h1>
        <p className="opacity-90">
          Виберіть план, який підходить саме вам
        </p>
      </div>

      {/* Subscription Plans */}
      <div className="space-y-4">
        {subscriptionPlans.map((plan) => (
          <Card
            key={plan.id}
            gradient={plan.recommended ? plan.color : undefined}
            className={`relative ${
              plan.recommended ? 'text-white' : 'border border-gray-100'
            }`}
            onClick={() => handleSelectPlan(plan)}
          >
            {plan.recommended && (
              <div className="absolute -top-3 right-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-medium">
                Рекомендовано
              </div>
            )}

            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold">{plan.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="w-4 h-4 opacity-70" />
                  <span className="text-sm opacity-70">{plan.duration}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">${plan.price}</div>
                <div className="text-sm opacity-70">за період</div>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {plan.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>

            <button
              className={`mt-4 w-full py-2 rounded-xl font-medium transition-colors ${
                selectedPlan?.id === plan.id
                  ? 'bg-green-500 text-white'
                  : plan.recommended
                  ? 'bg-white text-blue-600 hover:bg-blue-50'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {selectedPlan?.id === plan.id ? 'Вибрано' : 'Вибрати план'}
            </button>
          </Card>
        ))}
      </div>

      {/* Payment Methods */}
      {selectedPlan && (
        <>
          <h2 className="text-lg font-bold pt-4">Спосіб оплати</h2>
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <Card
                key={method.id}
                className="flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handlePayment(method.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-2 rounded-xl text-blue-600">
                    {method.icon}
                  </div>
                  <div>
                    <div className="font-medium">{method.name}</div>
                    <div className="text-sm text-gray-500">
                      {method.description}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Security Notice */}
      <Card className="bg-yellow-50 border border-yellow-100">
        <div className="flex gap-3">
          <Shield className="w-5 h-5 text-yellow-600 shrink-0" />
          <div className="text-sm text-yellow-700">
            <p className="font-medium">Безпечна оплата:</p>
            <ul className="mt-2 space-y-1">
              <li>• Всі платежі захищені шифруванням</li>
              <li>• Гарантія повернення коштів 7 днів</li>
              <li>• Цілодобова підтримка</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* FAQ */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold">Часті питання</h2>
        <Card>
          <details className="group">
            <summary className="flex justify-between items-center cursor-pointer">
              <span className="font-medium">Як відбувається оплата?</span>
              <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform" />
            </summary>
            <p className="mt-2 text-sm text-gray-600">
              Після вибору плану та способу оплати ви будете перенаправлені на захищену сторінку оплати.
              Після успішної оплати доступ до обраного плану буде активовано автоматично.
            </p>
          </details>
        </Card>
        <Card>
          <details className="group">
            <summary className="flex justify-between items-center cursor-pointer">
              <span className="font-medium">Чи можна змінити тариф?</span>
              <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform" />
            </summary>
            <p className="mt-2 text-sm text-gray-600">
              Так, ви можете змінити тариф у будь-який момент. При апгрейді різниця буде розрахована пропорційно
              залишку днів поточної підписки.
            </p>
          </details>
        </Card>
      </div>
    </div>
  );
};

export default PaymentPage;